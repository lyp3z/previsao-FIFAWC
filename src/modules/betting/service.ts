import { prisma } from '@/lib/prisma';

const EDGE_THRESHOLD = 0.03;    // min edge to flag as value bet (3%)
const EV_THRESHOLD   = 0;       // positive EV required

// ── Compute BettingInsights ───────────────────────────────────────────────────

/**
 * For each upcoming match that has both a MatchPrediction and MatchOdds,
 * calculate edge, EV and flag value bets.
 *
 * Edge  = modelProbability − impliedProbability
 * EV    = edge × offered_odd  (i.e. modelProb × odd − 1)
 * Fair  = 1 / modelProbability
 */
export async function computeBettingInsights(competitionId: string) {
  const model = await prisma.predictionModel.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!model) return { insightsUpserted: 0 };

  const predictions = await prisma.matchPrediction.findMany({
    where: { match: { competitionId }, modelId: model.id },
    include: { match: { select: { id: true, status: true } } },
  });

  if (predictions.length === 0) return { insightsUpserted: 0 };

  const matchIds = predictions.map(p => p.matchId);
  const oddsRows = await prisma.matchOdds.findMany({
    where: { matchId: { in: matchIds } },
    include: { bookmaker: true, market: true },
  });

  // Build lookup: matchId → marketCode → selectionCode → { prob, odd, bId, mId }
  type OddsEntry = { odd: number; impliedProb: number; bookmakerId: string; marketId: string };
  const oddsMap = new Map<string, OddsEntry>();
  for (const o of oddsRows) {
    const key = `${o.matchId}::${o.market.code}::${o.selectionCode}::${o.bookmakerId}`;
    oddsMap.set(key, { odd: o.odd, impliedProb: o.impliedProbability, bookmakerId: o.bookmakerId, marketId: o.marketId });
  }

  // Map prediction fields → market/selection codes
  const SELECTION_MAP: { predField: string; marketCode: string; selCode: string }[] = [
    { predField: 'homeWinProbability', marketCode: '1X2',   selCode: 'HOME'      },
    { predField: 'drawProbability',    marketCode: '1X2',   selCode: 'DRAW'      },
    { predField: 'awayWinProbability', marketCode: '1X2',   selCode: 'AWAY'      },
    { predField: 'over25Probability',  marketCode: 'OU_25', selCode: 'OVER_25'   },
    { predField: 'bttsYesProbability', marketCode: 'BTTS',  selCode: 'BTTS_YES'  },
  ];

  let upserted = 0;
  for (const pred of predictions) {
    for (const sel of SELECTION_MAP) {
      const modelProb = (pred as Record<string, unknown>)[sel.predField] as number | null;
      if (!modelProb) continue;

      // For each bookmaker that has this selection
      const candidates = oddsRows.filter(
        o => o.matchId === pred.matchId &&
             o.market.code === sel.marketCode &&
             o.selectionCode === sel.selCode,
      );

      for (const candidate of candidates) {
        const impliedProb = candidate.impliedProbability;
        const edge = round(modelProb - impliedProb);
        const ev   = round(modelProb * candidate.odd - 1);
        const fairOdd = round(1 / modelProb);
        const isValueBet = edge >= EDGE_THRESHOLD && ev > EV_THRESHOLD;
        const confidenceScore = round(Math.min(pred.confidenceScore + (edge > 0.1 ? 0.1 : 0), 1));
        const confidenceLabel =
          confidenceScore >= 0.8 ? 'HIGH' :
          confidenceScore >= 0.5 ? 'MEDIUM' : 'LOW';

        const explanation =
          `Model: ${(modelProb * 100).toFixed(1)}% | Market: ${(impliedProb * 100).toFixed(1)}% | ` +
          `Edge: ${(edge * 100).toFixed(1)}% | EV: ${ev.toFixed(3)} | Odd: ${candidate.odd}`;

        const id = `bi_${pred.matchId}_${candidate.bookmakerId}_${candidate.marketId}_${sel.selCode}`;
        await prisma.bettingInsight.upsert({
          where: { id },
          create: {
            id, matchId: pred.matchId,
            bookmakerId: candidate.bookmakerId,
            marketId: candidate.marketId,
            modelId: model.id,
            selectionCode: sel.selCode,
            modelProbability: modelProb,
            impliedProbability: impliedProb,
            fairOdd, offeredOdd: candidate.odd,
            edge, expectedValue: ev,
            confidenceScore, confidenceLabel,
            isValueBet, explanation,
          },
          update: {
            modelProbability: modelProb,
            impliedProbability: impliedProb,
            fairOdd, offeredOdd: candidate.odd,
            edge, expectedValue: ev,
            confidenceScore, confidenceLabel,
            isValueBet, explanation,
          },
        });
        upserted++;
      }
    }
  }

  return { insightsUpserted: upserted };
}

// ── Read helpers ──────────────────────────────────────────────────────────────

export async function getMatchInsights(matchId: string) {
  return prisma.bettingInsight.findMany({
    where: { matchId },
    include: {
      bookmaker: { select: { name: true, slug: true } },
      market:    { select: { code: true, name: true } },
      model:     { select: { name: true, version: true } },
    },
    orderBy: { expectedValue: 'desc' },
  });
}

export async function getTopValueBets(competitionId: string, limit = 20) {
  return prisma.bettingInsight.findMany({
    where: { isValueBet: true, match: { competitionId } },
    include: {
      match:     { select: { id: true, homeTeamId: true, awayTeamId: true, datetimeUtc: true } },
      bookmaker: { select: { name: true, slug: true } },
      market:    { select: { code: true, name: true } },
    },
    orderBy: { expectedValue: 'desc' },
    take: limit,
  });
}

export async function getBookmakerInsights(bookmakerId: string, competitionId: string) {
  return prisma.bettingInsight.findMany({
    where: { bookmakerId, match: { competitionId } },
    include: {
      match:  { select: { id: true, homeTeamId: true, awayTeamId: true, datetimeUtc: true } },
      market: { select: { code: true, name: true } },
    },
    orderBy: { expectedValue: 'desc' },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function round(n: number, d = 4) { return Math.round(n * 10 ** d) / 10 ** d; }
