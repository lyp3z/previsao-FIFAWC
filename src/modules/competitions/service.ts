import { prisma } from '@/lib/prisma';

export async function listCompetitions() {
  return prisma.competition.findMany({
    orderBy: { year: 'desc' },
    include: {
      currentStage: true,
    },
  });
}

export async function getCurrentCompetition() {
  return prisma.competition.findFirst({
    orderBy: { year: 'desc' },
    include: { currentStage: true },
  });
}

export async function getCompetitionById(id: string) {
  return prisma.competition.findUnique({
    where: { id },
    include: {
      currentStage: true,
      stages: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

export async function getCurrentStage(competitionId = 'wc_2026') {
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      currentStage: true,
      stages: {
        where: { isCurrent: true },
      },
    },
  });

  if (!competition) return null;

  return {
    competitionId: competition.id,
    stage: competition.currentStage ?? competition.stages[0] ?? null,
  };
}

export async function updateCurrentStage(competitionId: string, stageId: string) {
  await prisma.$transaction([
    prisma.stage.updateMany({
      where: { competitionId },
      data: { isCurrent: false },
    }),
    prisma.stage.update({
      where: { id: stageId },
      data: { isCurrent: true },
    }),
    prisma.competition.update({
      where: { id: competitionId },
      data: { currentStageId: stageId },
    }),
  ]);
}
