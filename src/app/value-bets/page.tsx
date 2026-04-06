import { prisma } from '@/lib/prisma';
import { ValueBetsClient } from './ValueBetsClient';

export const runtime = 'nodejs';
export const revalidate = 120;

export default async function ValueBetsPage() {
  const insights = await prisma.bettingInsight.findMany({
    where: { match: { competitionId: 'wc_2026' } },
    include: {
      match: {
        include: { homeTeam: true, awayTeam: true },
      },
      bookmaker: { select: { name: true, isSharp: true } },
      market: { select: { code: true, name: true } },
    },
    orderBy: { expectedValue: 'desc' },
  });

  const valueBets = insights.filter(i => i.isValueBet);
  const bestEV    = valueBets.length > 0 ? Math.max(...valueBets.map(i => i.expectedValue)) : 0;
  const avgEdge   = valueBets.length > 0
    ? valueBets.reduce((s, i) => s + i.edge, 0) / valueBets.length
    : 0;

  return (
    <ValueBetsClient
      insights={insights}
      stats={{ valueBetCount: valueBets.length, bestEV, avgEdge }}
    />
  );
}
