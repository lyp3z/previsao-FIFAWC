import type { OddsProvider, RawMatchOdds } from './types';

/**
 * Mock odds provider.
 * Generates realistic-looking decimal odds derived from a random base spread,
 * so the data is consistent but not real. Replace with RealOddsProvider in prod.
 */
export const MockOddsProvider: OddsProvider = {
  name: 'mock',

  async fetchOdds(matchIds: string[]): Promise<RawMatchOdds[]> {
    const now = new Date();
    const results: RawMatchOdds[] = [];

    const bookmakers = ['bet365', 'pinnacle', 'unibet'];
    const margins = { bet365: 1.06, pinnacle: 1.025, unibet: 1.05 };

    for (const matchId of matchIds) {
      // Deterministic seed per match so odds are reproducible
      const seed = hashCode(matchId);
      const rng  = seededRng(seed);

      // Random "true" probabilities for 1X2
      const rawHome = 0.3 + rng() * 0.4;
      const rawDraw = 0.18 + rng() * 0.12;
      const rawAway = 1 - rawHome - rawDraw;

      // Over 2.5
      const rawOver25 = 0.45 + rng() * 0.3;

      // BTTS
      const rawBTTS = 0.45 + rng() * 0.25;

      for (const bk of bookmakers) {
        const margin = margins[bk as keyof typeof margins];

        results.push({
          matchId, bookmaker: bk, capturedAt: now, marketCode: '1X2',
          selections: [
            { selectionCode: 'HOME', selectionLabel: 'Casa',   odd: toOdd(rawHome, margin, rng) },
            { selectionCode: 'DRAW', selectionLabel: 'Empate', odd: toOdd(rawDraw, margin, rng) },
            { selectionCode: 'AWAY', selectionLabel: 'Fora',   odd: toOdd(rawAway, margin, rng) },
          ],
        });

        results.push({
          matchId, bookmaker: bk, capturedAt: now, marketCode: 'OU_25',
          selections: [
            { selectionCode: 'OVER_25',  selectionLabel: 'Acima de 2.5', odd: toOdd(rawOver25,       margin, rng), line: 2.5 },
            { selectionCode: 'UNDER_25', selectionLabel: 'Abaixo de 2.5', odd: toOdd(1 - rawOver25,  margin, rng), line: 2.5 },
          ],
        });

        results.push({
          matchId, bookmaker: bk, capturedAt: now, marketCode: 'BTTS',
          selections: [
            { selectionCode: 'BTTS_YES', selectionLabel: 'Ambas marcam', odd: toOdd(rawBTTS,     margin, rng) },
            { selectionCode: 'BTTS_NO',  selectionLabel: 'Não ambas',    odd: toOdd(1 - rawBTTS, margin, rng) },
          ],
        });

        // Double Chance
        results.push({
          matchId, bookmaker: bk, capturedAt: now, marketCode: 'DC',
          selections: [
            { selectionCode: 'DC_1X', selectionLabel: '1X', odd: toOdd(rawHome + rawDraw, margin, rng) },
            { selectionCode: 'DC_X2', selectionLabel: 'X2', odd: toOdd(rawDraw + rawAway, margin, rng) },
            { selectionCode: 'DC_12', selectionLabel: '12', odd: toOdd(rawHome + rawAway, margin, rng) },
          ],
        });
      }
    }

    return results;
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert true probability to decimal odd with bookmaker margin + small jitter */
function toOdd(p: number, margin: number, rng: () => number): number {
  const adjusted = p * margin + (rng() - 0.5) * 0.03;
  const odd = 1 / Math.max(adjusted, 0.01);
  return Math.round(odd * 100) / 100;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
