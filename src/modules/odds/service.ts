import { prisma } from '@/lib/prisma';
import { getOddsProvider } from '@/providers/odds';
import { MatchStatus } from '@prisma/client';

// ── Sync odds from provider ───────────────────────────────────────────────────

export async function syncOdds(competitionId: string) {
  const provider = getOddsProvider();

  // Only sync upcoming/live matches
  const matches = await prisma.match.findMany({
    where: {
      competitionId,
      status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] },
    },
    select: { id: true },
  });

  if (matches.length === 0) return { synced: 0 };

  const matchIds = matches.map(m => m.id);
  const rawOdds  = await provider.fetchOdds(matchIds);

  // Ensure bookmakers and markets exist
  const bookmakers = await prisma.bookmaker.findMany();
  const markets    = await prisma.market.findMany();
  const bmMap  = new Map(bookmakers.map(b => [b.slug, b.id]));
  const mktMap = new Map(markets.map(m => [m.code, m.id]));

  let synced = 0;
  for (const raw of rawOdds) {
    const bId = bmMap.get(raw.bookmaker);
    const mId = mktMap.get(raw.marketCode);
    if (!bId || !mId) continue;

    for (const sel of raw.selections) {
      const impliedProbability = round(1 / sel.odd);
      await prisma.matchOdds.upsert({
        where: {
          // use a compound unique if needed – for now use create/update on first match per selection
          id: `${raw.matchId}_${bId}_${mId}_${sel.selectionCode}`,
        },
        create: {
          id: `${raw.matchId}_${bId}_${mId}_${sel.selectionCode}`,
          matchId: raw.matchId, bookmakerId: bId, marketId: mId,
          selectionCode: sel.selectionCode, selectionLabel: sel.selectionLabel,
          odd: sel.odd, line: sel.line ?? null,
          impliedProbability, capturedAt: raw.capturedAt,
        },
        update: {
          odd: sel.odd, line: sel.line ?? null,
          impliedProbability, capturedAt: raw.capturedAt,
        },
      });
      synced++;
    }
  }

  return { synced };
}

// ── Build OddsSnapshot (aggregated per match+market+selection) ────────────────

export async function buildOddsSnapshots(competitionId: string) {
  const oddsRows = await prisma.matchOdds.findMany({
    where: { match: { competitionId } },
  });

  type Agg = { odds: number[]; impProbs: number[]; marketId: string; matchId: string; selectionCode: string };
  const agg = new Map<string, Agg>();

  for (const o of oddsRows) {
    const key = `${o.matchId}::${o.marketId}::${o.selectionCode}`;
    if (!agg.has(key)) agg.set(key, { odds: [], impProbs: [], marketId: o.marketId, matchId: o.matchId, selectionCode: o.selectionCode });
    agg.get(key)!.odds.push(o.odd);
    agg.get(key)!.impProbs.push(o.impliedProbability);
  }

  let snapshots = 0;
  const now = new Date();
  for (const [, a] of agg) {
    const sorted = [...a.odds].sort((x, y) => x - y);
    await prisma.oddsSnapshot.upsert({
      where: { id: `snap_${a.matchId}_${a.marketId}_${a.selectionCode}` },
      create: {
        id: `snap_${a.matchId}_${a.marketId}_${a.selectionCode}`,
        matchId: a.matchId, marketId: a.marketId, selectionCode: a.selectionCode,
        averageOdd: round(mean(a.odds)),
        bestOdd:    sorted[sorted.length - 1],
        lowestOdd:  sorted[0],
        averageImpliedProbability: round(mean(a.impProbs)),
        capturedAt: now,
      },
      update: {
        averageOdd: round(mean(a.odds)),
        bestOdd:    sorted[sorted.length - 1],
        lowestOdd:  sorted[0],
        averageImpliedProbability: round(mean(a.impProbs)),
        capturedAt: now,
      },
    });
    snapshots++;
  }

  return { snapshots };
}

// ── Read helpers ──────────────────────────────────────────────────────────────

export async function getMatchOdds(matchId: string) {
  return prisma.matchOdds.findMany({
    where: { matchId },
    include: { bookmaker: true, market: true },
    orderBy: [{ marketId: 'asc' }, { odd: 'desc' }],
  });
}

export async function getBestOdds(matchId: string) {
  const snaps = await prisma.oddsSnapshot.findMany({
    where: { matchId },
    include: { market: true },
  });
  return snaps;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mean(arr: number[]) { return arr.reduce((s, v) => s + v, 0) / arr.length; }
function round(n: number, d = 4) { return Math.round(n * 10 ** d) / 10 ** d; }
