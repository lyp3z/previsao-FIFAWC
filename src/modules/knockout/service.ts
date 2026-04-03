import { QualificationStatus } from '@prisma/client';
import { cacheGet, cacheSet } from '@/lib/redis';
import { cacheKeys } from '@/lib/cache-keys';
import { prisma } from '@/lib/prisma';

const groupCodes = 'ABCDEFGHIJKL'.split('');

type QualifiedByGroup = {
  winners: Record<string, string>;
  runners: Record<string, string>;
  bestThirdIds: string[];
};

async function getQualifiedTeams(competitionId: string): Promise<QualifiedByGroup> {
  const standings = await prisma.standing.findMany({
    where: {
      competitionId,
      qualificationStatus: QualificationStatus.QUALIFIED,
    },
    orderBy: [{ group: { order: 'asc' } }, { position: 'asc' }],
    include: {
      group: true,
    },
  });

  const winners: Record<string, string> = {};
  const runners: Record<string, string> = {};
  const third = standings.filter((row) => row.position === 3);

  for (const row of standings) {
    const code = row.group.code;
    if (row.position === 1) winners[code] = row.teamId;
    if (row.position === 2) runners[code] = row.teamId;
  }

  return {
    winners,
    runners,
    bestThirdIds: third
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamId.localeCompare(b.teamId);
      })
      .slice(0, 8)
      .map((row) => row.teamId),
  };
}

function pairings(qualified: QualifiedByGroup): Array<{ slotCode: string; homeTeamId?: string; awayTeamId?: string }> {
  const w = qualified.winners;
  const r = qualified.runners;
  const t = qualified.bestThirdIds;

  return [
    { slotCode: 'R32_1', homeTeamId: w.A, awayTeamId: r.B },
    { slotCode: 'R32_2', homeTeamId: w.C, awayTeamId: r.D },
    { slotCode: 'R32_3', homeTeamId: w.E, awayTeamId: r.F },
    { slotCode: 'R32_4', homeTeamId: w.G, awayTeamId: r.H },
    { slotCode: 'R32_5', homeTeamId: w.I, awayTeamId: r.J },
    { slotCode: 'R32_6', homeTeamId: w.K, awayTeamId: r.L },
    { slotCode: 'R32_7', homeTeamId: w.B, awayTeamId: r.A },
    { slotCode: 'R32_8', homeTeamId: w.D, awayTeamId: r.C },
    { slotCode: 'R32_9', homeTeamId: w.F, awayTeamId: r.E },
    { slotCode: 'R32_10', homeTeamId: w.H, awayTeamId: r.G },
    { slotCode: 'R32_11', homeTeamId: w.J, awayTeamId: r.I },
    { slotCode: 'R32_12', homeTeamId: w.L, awayTeamId: r.K },
    { slotCode: 'R32_13', homeTeamId: t[0], awayTeamId: t[7] },
    { slotCode: 'R32_14', homeTeamId: t[1], awayTeamId: t[6] },
    { slotCode: 'R32_15', homeTeamId: t[2], awayTeamId: t[5] },
    { slotCode: 'R32_16', homeTeamId: t[3], awayTeamId: t[4] },
  ];
}

export async function generateKnockoutFromStandings(competitionId = 'wc_2026') {
  const qualified = await getQualifiedTeams(competitionId);
  const routes = pairings(qualified);

  for (const route of routes) {
    await prisma.knockoutSlot.updateMany({
      where: { competitionId, slotCode: route.slotCode },
      data: {
        homeTeamId: route.homeTeamId,
        awayTeamId: route.awayTeamId,
      },
    });
  }

  return getBracket(competitionId, true);
}

export async function getKnockout(competitionId = 'wc_2026') {
  return prisma.knockoutSlot.findMany({
    where: { competitionId },
    orderBy: [{ stage: { order: 'asc' } }, { slotCode: 'asc' }],
    include: {
      stage: true,
      homeTeam: true,
      awayTeam: true,
      winnerTeam: true,
    },
  });
}

export async function getBracket(competitionId = 'wc_2026', bypassCache = false) {
  const cacheKey = cacheKeys.bracket(competitionId);
  if (!bypassCache) {
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;
  }

  const slots = await getKnockout(competitionId);
  const grouped = slots.reduce<Record<string, typeof slots>>((acc, slot) => {
    const code = slot.stage.code;
    if (!acc[code]) acc[code] = [];
    acc[code].push(slot);
    return acc;
  }, {});

  await cacheSet(cacheKey, grouped, 120);
  return grouped;
}

export async function getTeamPath(teamId: string, competitionId = 'wc_2026') {
  const slots = await prisma.knockoutSlot.findMany({
    where: {
      competitionId,
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }, { winnerTeamId: teamId }],
    },
    orderBy: [{ stage: { order: 'asc' } }, { slotCode: 'asc' }],
    include: {
      stage: true,
      homeTeam: true,
      awayTeam: true,
      winnerTeam: true,
    },
  });

  if (slots.length > 0) {
    return slots;
  }

  const standing = await prisma.standing.findFirst({
    where: {
      competitionId,
      teamId,
    },
    include: {
      group: true,
    },
  });

  return {
    message: 'Team is not currently assigned to knockout slots',
    groupProjection: standing
      ? {
          groupCode: standing.group.code,
          position: standing.position,
          canAdvanceDirectly: standing.position <= 2,
          canAdvanceAsThird: standing.position === 3,
        }
      : null,
  };
}

export function projectedOpponentsByGroupPosition(groupCode: string, position: 1 | 2) {
  const normalized = groupCode.toUpperCase();
  if (!groupCodes.includes(normalized)) {
    throw new Error('Invalid group code');
  }

  const map: Record<string, { first: string; second: string }> = {
    A: { first: 'B2', second: 'B1' },
    B: { first: 'A2', second: 'A1' },
    C: { first: 'D2', second: 'D1' },
    D: { first: 'C2', second: 'C1' },
    E: { first: 'F2', second: 'F1' },
    F: { first: 'E2', second: 'E1' },
    G: { first: 'H2', second: 'H1' },
    H: { first: 'G2', second: 'G1' },
    I: { first: 'J2', second: 'J1' },
    J: { first: 'I2', second: 'I1' },
    K: { first: 'L2', second: 'L1' },
    L: { first: 'K2', second: 'K1' },
  };

  const target = map[normalized];
  return {
    groupCode: normalized,
    position,
    firstKnockoutOpponent: position === 1 ? target.first : target.second,
  };
}
