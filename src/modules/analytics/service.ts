import { prisma } from '@/lib/prisma';
import { MatchStatus } from '@prisma/client';

// ── Stats snapshot ────────────────────────────────────────────────────────────

/**
 * Recalculates TeamStatsSnapshot for every team in the competition.
 * Uses only FINISHED/LIVE matches to avoid polluting with zeros from SCHEDULED.
 */
export async function computeTeamStats(competitionId: string) {
  const matches = await prisma.match.findMany({
    where: {
      competitionId,
      status: { in: [MatchStatus.FINISHED, MatchStatus.LIVE] },
    },
    select: {
      homeTeamId: true, awayTeamId: true,
      homeScore: true, awayScore: true,
    },
  });

  // Aggregate per team
  type Acc = {
    played: number; wins: number; draws: number; losses: number;
    gf: number; ga: number; cleanSheets: number; failedToScore: number;
    points: number;
  };

  const stats = new Map<string, Acc>();

  const get = (id: string): Acc => {
    if (!stats.has(id)) stats.set(id, { played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, cleanSheets: 0, failedToScore: 0, points: 0 });
    return stats.get(id)!;
  };

  for (const m of matches) {
    const home = get(m.homeTeamId);
    const away = get(m.awayTeamId);
    home.played++; away.played++;
    home.gf += m.homeScore; home.ga += m.awayScore;
    away.gf += m.awayScore; away.ga += m.homeScore;
    if (m.awayScore === 0) home.cleanSheets++;
    if (m.homeScore === 0) away.cleanSheets++;
    if (m.homeScore === 0) home.failedToScore++;
    if (m.awayScore === 0) away.failedToScore++;
    if (m.homeScore > m.awayScore) { home.wins++; home.points += 3; away.losses++; }
    else if (m.homeScore === m.awayScore) { home.draws++; home.points++; away.draws++; away.points++; }
    else { away.wins++; away.points += 3; home.losses++; }
  }

  // League-average goals per match per team (used for Poisson strength)
  let totalGoals = 0;
  let totalMatches = matches.length;
  for (const m of matches) totalGoals += m.homeScore + m.awayScore;
  const leagueAvgGoals = totalMatches > 0 ? totalGoals / (totalMatches * 2) : 1.3;

  // Upsert all teams in this competition
  const teams = await prisma.team.findMany({
    where: { group: { competitionId } },
    select: { id: true },
  });

  for (const { id: teamId } of teams) {
    const s = stats.get(teamId);
    if (!s || s.played === 0) {
      await prisma.teamStatsSnapshot.upsert({
        where: { teamId },
        create: {
          teamId, competitionId,
          matchesPlayed: 0, wins: 0, draws: 0, losses: 0,
          goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
          avgGoalsFor: 0, avgGoalsAgainst: 0,
          cleanSheets: 0, failedToScore: 0,
          pointsPerMatch: 0, recentFormScore: 0,
          attackStrength: 1, defenseStrength: 1,
        },
        update: {
          competitionId, matchesPlayed: 0,
          attackStrength: 1, defenseStrength: 1,
          recentFormScore: 0,
        },
      });
      continue;
    }

    const avgGF = s.gf / s.played;
    const avgGA = s.ga / s.played;
    const attackStrength  = leagueAvgGoals > 0 ? avgGF / leagueAvgGoals : 1;
    const defenseStrength = leagueAvgGoals > 0 ? avgGA / leagueAvgGoals : 1;
    const pointsPerMatch  = s.points / s.played;
    const recentFormScore = pointsPerMatch / 3; // 0–1 normalised

    await prisma.teamStatsSnapshot.upsert({
      where: { teamId },
      create: {
        teamId, competitionId,
        matchesPlayed: s.played, wins: s.wins, draws: s.draws, losses: s.losses,
        goalsFor: s.gf, goalsAgainst: s.ga, goalDifference: s.gf - s.ga,
        avgGoalsFor: avgGF, avgGoalsAgainst: avgGA,
        cleanSheets: s.cleanSheets, failedToScore: s.failedToScore,
        pointsPerMatch, recentFormScore,
        attackStrength: round(attackStrength),
        defenseStrength: round(defenseStrength),
      },
      update: {
        matchesPlayed: s.played, wins: s.wins, draws: s.draws, losses: s.losses,
        goalsFor: s.gf, goalsAgainst: s.ga, goalDifference: s.gf - s.ga,
        avgGoalsFor: avgGF, avgGoalsAgainst: avgGA,
        cleanSheets: s.cleanSheets, failedToScore: s.failedToScore,
        pointsPerMatch, recentFormScore,
        attackStrength: round(attackStrength),
        defenseStrength: round(defenseStrength),
      },
    });
  }

  return { teamsUpdated: teams.length, matchesConsidered: totalMatches };
}

// ── Feature sets ──────────────────────────────────────────────────────────────

/**
 * Builds MatchFeatureSet for every unplayed match in the competition.
 * Requires stats snapshots to exist first (run computeTeamStats before this).
 */
export async function computeMatchFeatures(competitionId: string) {
  const [matches, statsRows] = await Promise.all([
    prisma.match.findMany({
      where: { competitionId, status: MatchStatus.SCHEDULED },
      select: { id: true, homeTeamId: true, awayTeamId: true, stageId: true, groupId: true },
    }),
    prisma.teamStatsSnapshot.findMany({
      where: { competitionId },
    }),
  ]);

  const statsMap = new Map(statsRows.map((s) => [s.teamId, s]));

  const stage = await prisma.stage.findFirst({
    where: { competitionId, isCurrent: true },
    select: { type: true },
  });
  const isKnockout = stage?.type === 'KNOCKOUT';
  const stageWeight = isKnockout ? 1.5 : 1.0;

  const DEFAULT = {
    recentFormScore: 0, attackStrength: 1, defenseStrength: 1,
    avgGoalsFor: 0, avgGoalsAgainst: 0, pointsPerMatch: 0,
  };

  let upserted = 0;
  for (const m of matches) {
    const h = statsMap.get(m.homeTeamId) ?? DEFAULT;
    const a = statsMap.get(m.awayTeamId) ?? DEFAULT;

    await prisma.matchFeatureSet.upsert({
      where: { matchId: m.id },
      create: {
        matchId: m.id, competitionId,
        homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId,
        homeRecentForm: h.recentFormScore, awayRecentForm: a.recentFormScore,
        homeAttackStrength: h.attackStrength, awayAttackStrength: a.attackStrength,
        homeDefenseStrength: h.defenseStrength, awayDefenseStrength: a.defenseStrength,
        homeAvgGoalsFor: h.avgGoalsFor, awayAvgGoalsFor: a.avgGoalsFor,
        homeAvgGoalsAgainst: h.avgGoalsAgainst, awayAvgGoalsAgainst: a.avgGoalsAgainst,
        homePointsPerMatch: h.pointsPerMatch, awayPointsPerMatch: a.pointsPerMatch,
        stageWeight, isKnockout,
      },
      update: {
        homeRecentForm: h.recentFormScore, awayRecentForm: a.recentFormScore,
        homeAttackStrength: h.attackStrength, awayAttackStrength: a.attackStrength,
        homeDefenseStrength: h.defenseStrength, awayDefenseStrength: a.defenseStrength,
        homeAvgGoalsFor: h.avgGoalsFor, awayAvgGoalsFor: a.avgGoalsFor,
        homeAvgGoalsAgainst: h.avgGoalsAgainst, awayAvgGoalsAgainst: a.avgGoalsAgainst,
        homePointsPerMatch: h.pointsPerMatch, awayPointsPerMatch: a.pointsPerMatch,
        stageWeight, isKnockout,
      },
    });
    upserted++;
  }

  return { featuresUpserted: upserted };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function round(n: number, decimals = 4) {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}
