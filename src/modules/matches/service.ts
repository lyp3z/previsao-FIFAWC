import { MatchStatus, Prisma } from '@prisma/client';
import { cacheGet, cacheSet } from '@/lib/redis';
import { cacheKeys } from '@/lib/cache-keys';
import { prisma } from '@/lib/prisma';

type MatchFilters = {
  date?: string;
  stage?: string;
  group?: string;
  status?: string;
  team?: string;
  liveOnly?: string;
};

function normalizeKey(filters: MatchFilters) {
  return JSON.stringify(
    Object.keys(filters)
      .sort()
      .reduce<Record<string, string>>((acc, key) => {
        const value = filters[key as keyof MatchFilters];
        if (value) acc[key] = value;
        return acc;
      }, {}),
  );
}

export async function listMatches(filters: MatchFilters = {}, competitionId = 'wc_2026') {
  const cacheKey = cacheKeys.matches(`list:${competitionId}:${normalizeKey(filters)}`);
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) return cached;

  const where: Prisma.MatchWhereInput = {
    competitionId,
  };

  if (filters.date) {
    const start = new Date(`${filters.date}T00:00:00.000Z`);
    const end = new Date(`${filters.date}T23:59:59.999Z`);
    where.datetimeUtc = { gte: start, lte: end };
  }

  if (filters.stage) {
    where.stage = { code: filters.stage.toUpperCase() };
  }

  if (filters.group) {
    where.group = { code: filters.group.toUpperCase() };
  }

  if (filters.status) {
    where.status = filters.status.toUpperCase() as MatchStatus;
  }

  if (filters.team) {
    where.OR = [
      { homeTeam: { id: filters.team } },
      { awayTeam: { id: filters.team } },
      { homeTeam: { code: filters.team.toUpperCase() } },
      { awayTeam: { code: filters.team.toUpperCase() } },
    ];
  }

  if (filters.liveOnly === 'true') {
    where.isLive = true;
  }

  const result = await prisma.match.findMany({
    where,
    orderBy: { datetimeUtc: 'asc' },
    include: {
      stage: true,
      group: true,
      homeTeam: true,
      awayTeam: true,
      winnerTeam: true,
    },
  });

  await cacheSet(cacheKey, result, 60);
  return result;
}

export async function getMatchById(id: string) {
  const cacheKey = cacheKeys.matchById(id);
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) return cached;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      stage: true,
      group: true,
      homeTeam: true,
      awayTeam: true,
      winnerTeam: true,
    },
  });

  if (match) {
    await cacheSet(cacheKey, match, 60);
  }

  return match;
}

export async function listLiveMatches(competitionId = 'wc_2026') {
  return listMatches({ liveOnly: 'true' }, competitionId);
}

export async function listTodayMatches(competitionId = 'wc_2026') {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  return listMatches({ date }, competitionId);
}

export async function listUpcomingMatches(competitionId = 'wc_2026') {
  return prisma.match.findMany({
    where: {
      competitionId,
      datetimeUtc: { gt: new Date() },
      status: MatchStatus.SCHEDULED,
    },
    orderBy: { datetimeUtc: 'asc' },
    include: {
      stage: true,
      group: true,
      homeTeam: true,
      awayTeam: true,
    },
    take: 20,
  });
}

export async function listResults(competitionId = 'wc_2026') {
  return prisma.match.findMany({
    where: {
      competitionId,
      status: MatchStatus.FINISHED,
    },
    orderBy: { datetimeUtc: 'desc' },
    include: {
      stage: true,
      group: true,
      homeTeam: true,
      awayTeam: true,
      winnerTeam: true,
    },
    take: 50,
  });
}
