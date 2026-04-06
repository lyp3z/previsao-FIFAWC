import { prisma } from '@/lib/prisma';
import { JogosClient } from './JogosClient';

export const runtime = 'nodejs';
export const revalidate = 60;

export default async function JogosPage() {
  const matches = await prisma.match.findMany({
    where: { competitionId: 'wc_2026' },
    include: {
      homeTeam: true,
      awayTeam: true,
      group: true,
      stage: true,
      prediction: true,
    },
    orderBy: { datetimeUtc: 'asc' },
  });

  return <JogosClient matches={matches} />;
}
