import { MatchStatus, QualificationStatus, type Match, type Team } from '@prisma/client';
import { cacheGet, cacheSet } from '@/lib/redis';
import { cacheKeys } from '@/lib/cache-keys';
import { prisma } from '@/lib/prisma';

type StandingRow = {
  teamId: string;
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
  qualificationStatus: QualificationStatus;
};

type MatchLike = Pick<Match, 'homeTeamId' | 'awayTeamId' | 'homeScore' | 'awayScore' | 'status'>;

function applyMatch(rowHome: StandingRow, rowAway: StandingRow, match: MatchLike) {
  const homeScore = match.homeScore;
  const awayScore = match.awayScore;

  rowHome.played += 1;
  rowAway.played += 1;

  rowHome.goalsFor += homeScore;
  rowHome.goalsAgainst += awayScore;
  rowAway.goalsFor += awayScore;
  rowAway.goalsAgainst += homeScore;

  if (homeScore > awayScore) {
    rowHome.wins += 1;
    rowAway.losses += 1;
    rowHome.points += 3;
  } else if (awayScore > homeScore) {
    rowAway.wins += 1;
    rowHome.losses += 1;
    rowAway.points += 3;
  } else {
    rowHome.draws += 1;
    rowAway.draws += 1;
    rowHome.points += 1;
    rowAway.points += 1;
  }

  rowHome.goalDifference = rowHome.goalsFor - rowHome.goalsAgainst;
  rowAway.goalDifference = rowAway.goalsFor - rowAway.goalsAgainst;
}

function headToHeadComparator(teamA: StandingRow, teamB: StandingRow, matches: MatchLike[]) {
  const headToHeadMatches = matches.filter(
    (match) =>
      (match.homeTeamId === teamA.teamId && match.awayTeamId === teamB.teamId) ||
      (match.homeTeamId === teamB.teamId && match.awayTeamId === teamA.teamId),
  );

  if (headToHeadMatches.length === 0) return 0;

  let pointsA = 0;
  let pointsB = 0;
  let goalDiffA = 0;
  let goalsA = 0;

  for (const match of headToHeadMatches) {
    const home = match.homeTeamId;
    const hs = match.homeScore;
    const as = match.awayScore;

    if (home === teamA.teamId) {
      goalsA += hs;
      goalDiffA += hs - as;
      if (hs > as) pointsA += 3;
      else if (hs < as) pointsB += 3;
      else {
        pointsA += 1;
        pointsB += 1;
      }
    } else {
      goalsA += as;
      goalDiffA += as - hs;
      if (as > hs) pointsA += 3;
      else if (as < hs) pointsB += 3;
      else {
        pointsA += 1;
        pointsB += 1;
      }
    }
  }

  if (pointsA !== pointsB) return pointsB - pointsA;
  if (goalDiffA !== 0) return -goalDiffA;
  if (goalsA !== 0) return -goalsA;
  return teamA.team.name.localeCompare(teamB.team.name);
}

function sortStandings(rows: StandingRow[], matches: MatchLike[]) {
  return rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    const h2h = headToHeadComparator(a, b, matches);
    if (h2h !== 0) return h2h;

    return a.team.name.localeCompare(b.team.name);
  });
}

export function computeGroupStandings(teams: Team[], matches: MatchLike[]): StandingRow[] {
  const rows = teams.map<StandingRow>((team) => ({
    teamId: team.id,
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    position: 0,
    qualificationStatus: QualificationStatus.TBD,
  }));

  const map = new Map(rows.map((row) => [row.teamId, row]));

  for (const match of matches) {
    const isPlayed =
      match.status === MatchStatus.FINISHED ||
      match.status === MatchStatus.LIVE;

    if (!isPlayed) continue;

    const home = map.get(match.homeTeamId);
    const away = map.get(match.awayTeamId);
    if (!home || !away) continue;

    applyMatch(home, away, match);
  }

  const sorted = sortStandings(rows, matches);
  sorted.forEach((row, index) => {
    row.position = index + 1;
    if (row.position <= 2) row.qualificationStatus = QualificationStatus.QUALIFIED;
    else if (row.position === 3) row.qualificationStatus = QualificationStatus.PLAYOFF;
    else row.qualificationStatus = QualificationStatus.ELIMINATED;
  });

  return sorted;
}

export async function recomputeAndPersistStandings(competitionId = 'wc_2026') {
  const groupStage = await prisma.stage.findFirst({
    where: { competitionId, code: 'GROUP' },
  });

  if (!groupStage) {
    throw new Error('Group stage not found for competition');
  }

  const groups = await prisma.group.findMany({
    where: { competitionId },
    orderBy: { order: 'asc' },
    include: {
      teams: true,
      matches: {
        where: { stageId: groupStage.id },
      },
    },
  });

  const computedByGroup = groups.map((group) => ({
    group,
    standings: computeGroupStandings(group.teams, group.matches),
  }));

  const thirdRows = computedByGroup
    .map((entry) => entry.standings.find((row) => row.position === 3))
    .filter((row): row is StandingRow => Boolean(row))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.name.localeCompare(b.team.name);
    });

  const qualifiedThirdIds = new Set(thirdRows.slice(0, 8).map((row) => row.teamId));

  for (const entry of computedByGroup) {
    for (const row of entry.standings) {
      const status =
        row.position <= 2
          ? QualificationStatus.QUALIFIED
          : row.position === 3
            ? qualifiedThirdIds.has(row.teamId)
              ? QualificationStatus.QUALIFIED
              : QualificationStatus.ELIMINATED
            : QualificationStatus.ELIMINATED;

      await prisma.standing.upsert({
        where: {
          competitionId_stageId_groupId_teamId: {
            competitionId,
            stageId: groupStage.id,
            groupId: entry.group.id,
            teamId: row.teamId,
          },
        },
        create: {
          id: `standing_${entry.group.code}_${row.teamId}`,
          competitionId,
          stageId: groupStage.id,
          groupId: entry.group.id,
          teamId: row.teamId,
          played: row.played,
          wins: row.wins,
          draws: row.draws,
          losses: row.losses,
          goalsFor: row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          goalDifference: row.goalDifference,
          points: row.points,
          position: row.position,
          qualificationStatus: status,
        },
        update: {
          played: row.played,
          wins: row.wins,
          draws: row.draws,
          losses: row.losses,
          goalsFor: row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          goalDifference: row.goalDifference,
          points: row.points,
          position: row.position,
          qualificationStatus: status,
        },
      });
    }
  }

  return getStandings(competitionId, true);
}

export async function getStandings(competitionId = 'wc_2026', bypassCache = false) {
  const cacheKey = cacheKeys.standingsAll(competitionId);
  if (!bypassCache) {
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;
  }

  const standings = await prisma.standing.findMany({
    where: { competitionId },
    orderBy: [{ group: { order: 'asc' } }, { position: 'asc' }],
    include: {
      group: true,
      team: true,
      stage: true,
    },
  });

  await cacheSet(cacheKey, standings, 120);
  return standings;
}

export async function getStandingsByGroupCode(groupCode: string, competitionId = 'wc_2026') {
  const code = groupCode.toUpperCase();
  const cacheKey = cacheKeys.standingsGroup(competitionId, code);
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) return cached;

  const standings = await prisma.standing.findMany({
    where: {
      competitionId,
      group: {
        code,
      },
    },
    orderBy: { position: 'asc' },
    include: {
      team: true,
      group: true,
      stage: true,
    },
  });

  await cacheSet(cacheKey, standings, 120);
  return standings;
}
