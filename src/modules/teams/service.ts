import { prisma } from '@/lib/prisma';
import { getTeamPath } from '@/modules/knockout/service';

export async function listTeams(competitionId = 'wc_2026') {
  return prisma.team.findMany({
    where: {
      group: {
        competitionId,
      },
    },
    orderBy: [{ group: { order: 'asc' } }, { name: 'asc' }],
    include: {
      group: true,
    },
  });
}

export async function getTeamById(teamId: string) {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: { group: true },
  });
}

export async function getTeamMatches(teamId: string, competitionId = 'wc_2026') {
  return prisma.match.findMany({
    where: {
      competitionId,
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
    },
    orderBy: { datetimeUtc: 'asc' },
    include: {
      stage: true,
      group: true,
      homeTeam: true,
      awayTeam: true,
      winnerTeam: true,
    },
  });
}

export async function getTeamTournamentPath(teamId: string, competitionId = 'wc_2026') {
  return getTeamPath(teamId, competitionId);
}
