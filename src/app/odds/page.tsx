import { prisma } from '@/lib/prisma';
import { OddsClient } from './OddsClient';

export const runtime = 'nodejs';
export const revalidate = 120;

export default async function OddsPage() {
  const rawOdds = await prisma.matchOdds.findMany({
    where: { match: { competitionId: 'wc_2026' } },
    include: {
      match: {
        include: { homeTeam: true, awayTeam: true, group: true, stage: true },
      },
      bookmaker: { select: { id: true, name: true, isSharp: true } },
      market: { select: { id: true, code: true, name: true } },
    },
    orderBy: { capturedAt: 'desc' },
  });

  // Group by match, then bookmaker, then selection
  const matchMap = new Map<string, {
    matchId: string;
    match: {
      homeTeam: { code: string; shortName: string };
      awayTeam: { code: string; shortName: string };
      roundLabel: string | null;
      group: { code: string } | null;
      stage: { name: string };
    };
    capturedAt: string;
    bookmakers: Map<string, {
      bookmakerName: string;
      isSharp: boolean;
      odds: Map<string, { odd: number; impliedProbability: number; label: string }>;
    }>;
  }>();

  for (const row of rawOdds) {
    if (!matchMap.has(row.matchId)) {
      matchMap.set(row.matchId, {
        matchId: row.matchId,
        match: {
          homeTeam: row.match.homeTeam,
          awayTeam: row.match.awayTeam,
          roundLabel: row.match.roundLabel,
          group: row.match.group,
          stage: row.match.stage,
        },
        capturedAt: row.capturedAt.toISOString().slice(0, 10),
        bookmakers: new Map(),
      });
    }
    const matchEntry = matchMap.get(row.matchId)!;

    const bkKey = row.bookmaker.id;
    if (!matchEntry.bookmakers.has(bkKey)) {
      matchEntry.bookmakers.set(bkKey, {
        bookmakerName: row.bookmaker.name,
        isSharp: row.bookmaker.isSharp ?? false,
        odds: new Map(),
      });
    }
    matchEntry.bookmakers.get(bkKey)!.odds.set(row.selectionCode, {
      odd: row.odd,
      impliedProbability: row.impliedProbability,
      label: row.selectionLabel,
    });
  }

  // Serialize to plain objects
  const matchOddsData = Array.from(matchMap.values()).map(m => {
    const bookmakers = Array.from(m.bookmakers.values()).map(bk => ({
      bookmakerName: bk.bookmakerName,
      isSharp: bk.isSharp,
      odds: Object.fromEntries(bk.odds),
    }));

    // Compute best odds per selection
    const allSelCodes = new Set<string>();
    for (const bk of bookmakers) Object.keys(bk.odds).forEach(k => allSelCodes.add(k));

    const best: Record<string, number> = {};
    for (const code of allSelCodes) {
      const vals = bookmakers.map(bk => bk.odds[code]?.odd ?? 0).filter(v => v > 0);
      if (vals.length > 0) best[code] = Math.max(...vals);
    }

    // Average implied for 1X2
    const avgImplied = {
      home:  bookmakers.reduce((s, bk) => s + (bk.odds['HOME']?.impliedProbability ?? 0), 0) / (bookmakers.length || 1),
      draw:  bookmakers.reduce((s, bk) => s + (bk.odds['DRAW']?.impliedProbability ?? 0), 0) / (bookmakers.length || 1),
      away:  bookmakers.reduce((s, bk) => s + (bk.odds['AWAY']?.impliedProbability ?? 0), 0) / (bookmakers.length || 1),
    };

    return {
      matchId: m.matchId,
      match: m.match,
      capturedAt: m.capturedAt,
      bookmakers,
      best,
      avgImplied,
    };
  });

  return <OddsClient matchOddsData={matchOddsData} />;
}
