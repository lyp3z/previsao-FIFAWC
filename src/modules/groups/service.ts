import { prisma } from '@/lib/prisma';

export async function listGroups(competitionId = 'wc_2026') {
  return prisma.group.findMany({
    where: { competitionId },
    orderBy: { order: 'asc' },
    include: {
      teams: {
        orderBy: { name: 'asc' },
      },
    },
  });
}

export async function getGroupByCode(groupCode: string, competitionId = 'wc_2026') {
  return prisma.group.findFirst({
    where: {
      competitionId,
      code: groupCode.toUpperCase(),
    },
    include: {
      teams: true,
      matches: {
        orderBy: { datetimeUtc: 'asc' },
      },
    },
  });
}
