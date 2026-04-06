import { prisma } from '@/lib/prisma';
import { ProbabilidadesClient } from './ProbabilidadesClient';

export const runtime = 'nodejs';
export const revalidate = 300;

export default async function ProbabilidadesPage() {
  const [predictions, projections] = await Promise.all([
    prisma.matchPrediction.findMany({
      where: { match: { competitionId: 'wc_2026' } },
      include: {
        match: { include: { homeTeam: true, awayTeam: true, group: true, stage: true } },
        model: { select: { name: true, version: true } },
      },
      orderBy: { match: { datetimeUtc: 'asc' } },
    }),
    prisma.teamTournamentProjection.findMany({
      where: { competitionId: 'wc_2026' },
      include: { team: true },
      orderBy: { winTournamentProbability: 'desc' },
    }),
  ]);

  return <ProbabilidadesClient predictions={predictions} projections={projections} />;
}
