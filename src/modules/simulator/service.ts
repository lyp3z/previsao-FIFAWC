import { createHash } from 'crypto';
import { MatchStatus, QualificationStatus, type Match, type Team } from '@prisma/client';
import { cacheGet, cacheSet } from '@/lib/redis';
import { cacheKeys } from '@/lib/cache-keys';
import { prisma } from '@/lib/prisma';
import { computeGroupStandings } from '@/modules/standings/service';
import { projectedOpponentsByGroupPosition } from '@/modules/knockout/service';

type Override = {
  matchId: string;
  homeScore: number;
  awayScore: number;
};

type MatchLike = Pick<Match, 'id' | 'groupId' | 'homeTeamId' | 'awayTeamId' | 'homeScore' | 'awayScore' | 'status'>;

type GroupWithTeams = {
  id: string;
  code: string;
  teams: Team[];
};

type SimulatedStandingsResult = {
  groups: Array<{
    groupCode: string;
    rows: ReturnType<typeof computeGroupStandings>;
  }>;
  bestThird: Array<{
    groupCode: string;
    row: ReturnType<typeof computeGroupStandings>[number];
  }>;
};

function applyOverrides(matches: MatchLike[], overrides: Override[]): MatchLike[] {
  const map = new Map(overrides.map((o) => [o.matchId, o]));
  return matches.map((match) => {
    const override = map.get(match.id);
    if (!override) return match;

    return {
      ...match,
      homeScore: override.homeScore,
      awayScore: override.awayScore,
      status: MatchStatus.FINISHED,
    };
  });
}

function buildThirdRanking(groupStandings: Array<{ groupCode: string; rows: ReturnType<typeof computeGroupStandings> }>) {
  return groupStandings
    .map((entry) => ({
      groupCode: entry.groupCode,
      row: entry.rows.find((row) => row.position === 3),
    }))
    .filter((entry): entry is { groupCode: string; row: ReturnType<typeof computeGroupStandings>[number] } => Boolean(entry.row))
    .sort((a, b) => {
      if (b.row.points !== a.row.points) return b.row.points - a.row.points;
      if (b.row.goalDifference !== a.row.goalDifference) return b.row.goalDifference - a.row.goalDifference;
      if (b.row.goalsFor !== a.row.goalsFor) return b.row.goalsFor - a.row.goalsFor;
      return a.row.team.name.localeCompare(b.row.team.name);
    });
}

function summarize(groupStandings: Array<{ groupCode: string; rows: ReturnType<typeof computeGroupStandings> }>) {
  const lines: string[] = [];
  for (const group of groupStandings) {
    const leader = group.rows[0];
    lines.push(`Group ${group.groupCode}: ${leader.team.shortName} leads with ${leader.points} pts.`);
  }
  return lines.join(' ');
}

async function loadSimulationBase(competitionId: string) {
  const [groups, matches] = await Promise.all([
    prisma.group.findMany({
      where: { competitionId },
      orderBy: { order: 'asc' },
      select: { id: true, code: true, teams: true },
    }),
    prisma.match.findMany({
      where: {
        competitionId,
        groupId: { not: null },
      },
      select: {
        id: true,
        groupId: true,
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        status: true,
      },
    }),
  ]);

  return { groups: groups as GroupWithTeams[], matches: matches as MatchLike[] };
}

export async function simulateStandings(
  overrides: Override[],
  competitionId = 'wc_2026',
): Promise<SimulatedStandingsResult> {
  const keyInput = JSON.stringify({ competitionId, overrides, mode: 'standings' });
  const cacheKey = cacheKeys.simulator(createHash('sha256').update(keyInput).digest('hex'));

  const cached = await cacheGet<SimulatedStandingsResult>(cacheKey);
  if (cached) return cached;

  const { groups, matches } = await loadSimulationBase(competitionId);
  const simulatedMatches = applyOverrides(matches, overrides);

  const standingsByGroup = groups.map((group) => {
    const groupMatches = simulatedMatches.filter((match) => match.groupId === group.id);
    const rows = computeGroupStandings(group.teams, groupMatches).map((row) => ({
      ...row,
      qualificationStatus: row.position <= 2 ? QualificationStatus.QUALIFIED : QualificationStatus.ELIMINATED,
    }));
    return {
      groupCode: group.code,
      rows,
    };
  });

  const bestThird = buildThirdRanking(standingsByGroup).slice(0, 8);
  for (const third of bestThird) {
    third.row.qualificationStatus = QualificationStatus.QUALIFIED;
  }

  const result = {
    groups: standingsByGroup,
    bestThird,
  };

  await cacheSet(cacheKey, result, 120);
  return result;
}

export async function simulateKnockout(overrides: Override[], competitionId = 'wc_2026') {
  const standings = await simulateStandings(overrides, competitionId);

  const winners: Record<string, string> = {};
  const runners: Record<string, string> = {};
  for (const group of standings.groups) {
    winners[group.groupCode] = group.rows[0].teamId;
    runners[group.groupCode] = group.rows[1].teamId;
  }

  const third = standings.bestThird.map((entry) => entry.row.teamId);

  return {
    round32: [
      { slotCode: 'R32_1', homeTeamId: winners.A, awayTeamId: runners.B },
      { slotCode: 'R32_2', homeTeamId: winners.C, awayTeamId: runners.D },
      { slotCode: 'R32_3', homeTeamId: winners.E, awayTeamId: runners.F },
      { slotCode: 'R32_4', homeTeamId: winners.G, awayTeamId: runners.H },
      { slotCode: 'R32_5', homeTeamId: winners.I, awayTeamId: runners.J },
      { slotCode: 'R32_6', homeTeamId: winners.K, awayTeamId: runners.L },
      { slotCode: 'R32_7', homeTeamId: winners.B, awayTeamId: runners.A },
      { slotCode: 'R32_8', homeTeamId: winners.D, awayTeamId: runners.C },
      { slotCode: 'R32_9', homeTeamId: winners.F, awayTeamId: runners.E },
      { slotCode: 'R32_10', homeTeamId: winners.H, awayTeamId: runners.G },
      { slotCode: 'R32_11', homeTeamId: winners.J, awayTeamId: runners.I },
      { slotCode: 'R32_12', homeTeamId: winners.L, awayTeamId: runners.K },
      { slotCode: 'R32_13', homeTeamId: third[0], awayTeamId: third[7] },
      { slotCode: 'R32_14', homeTeamId: third[1], awayTeamId: third[6] },
      { slotCode: 'R32_15', homeTeamId: third[2], awayTeamId: third[5] },
      { slotCode: 'R32_16', homeTeamId: third[3], awayTeamId: third[4] },
    ],
  };
}

export async function simulateFull(overrides: Override[], competitionId = 'wc_2026') {
  const [standings, knockout] = await Promise.all([
    simulateStandings(overrides, competitionId),
    simulateKnockout(overrides, competitionId),
  ]);

  return {
    standings,
    knockout,
    summary: summarize(standings.groups),
  };
}

export async function simulateTeamPath(teamId: string, overrides: Override[], competitionId = 'wc_2026') {
  const standings = await simulateStandings(overrides, competitionId);

  const foundGroup = standings.groups.find((group) => group.rows.some((row) => row.teamId === teamId));
  if (!foundGroup) {
    return {
      teamId,
      found: false,
      message: 'Team not found in simulated competition data',
    };
  }

  const row = foundGroup.rows.find((entry) => entry.teamId === teamId)!;
  const projected = row.position <= 2 ? projectedOpponentsByGroupPosition(foundGroup.groupCode, row.position as 1 | 2) : null;

  return {
    teamId,
    found: true,
    groupCode: foundGroup.groupCode,
    position: row.position,
    points: row.points,
    qualified: row.qualificationStatus === QualificationStatus.QUALIFIED,
    projectedOpponent: projected,
  };
}
