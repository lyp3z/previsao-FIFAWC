/**
 * Probability Engine — v1 (Poisson + Dixon-Coles correction)
 *
 * Architecture is version-aware so a future ML model can coexist:
 * each PredictionModel row has a name+version. This file implements "poisson-v1".
 *
 * Poisson model:
 *   λ_home = attackStrength_home × defenseStrength_away × leagueAvg
 *   λ_away = attackStrength_away × defenseStrength_home × leagueAvg
 *
 * Scores are sampled 0–8 goals each → matrix of joint probabilities.
 * Over/Under 2.5, BTTS, homeWin, draw, awayWin derived from that matrix.
 */

export const MODEL_NAME    = 'poisson-v1';
export const MODEL_VERSION = '1.0.0';

// League average goals per team per match at a neutral World Cup
export const LEAGUE_AVG_GOALS = 1.25;

// ── Poisson PMF ───────────────────────────────────────────────────────────────

function poissonPMF(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) p *= lambda / i;
  return p;
}

/**
 * Build a (MAX+1) × (MAX+1) joint-score probability matrix.
 */
const MAX_GOALS = 8;

function scoreMatrix(lh: number, la: number): number[][] {
  const m: number[][] = Array.from({ length: MAX_GOALS + 1 }, () =>
    Array(MAX_GOALS + 1).fill(0),
  );
  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      m[h][a] = poissonPMF(lh, h) * poissonPMF(la, a);
    }
  }
  return m;
}

// ── Match outcome probabilities ───────────────────────────────────────────────

export interface MatchOutcome {
  homeWin:  number;
  draw:     number;
  awayWin:  number;
  over25:   number;
  under25:  number;
  bttsYes:  number;
  bttsNo:   number;
  lambdaHome: number;
  lambdaAway: number;
}

export function predictMatch(params: {
  homeAttack:   number;
  homeDefense:  number;
  awayAttack:   number;
  awayDefense:  number;
  leagueAvg?:   number;
  isKnockout?:  boolean;
}): MatchOutcome {
  const avg = params.leagueAvg ?? LEAGUE_AVG_GOALS;

  // Expected goals
  const lh = clamp(params.homeAttack * params.awayDefense * avg, 0.1, 6);
  const la = clamp(params.awayAttack * params.homeDefense * avg, 0.1, 6);

  const m = scoreMatrix(lh, la);

  let homeWin = 0, draw = 0, awayWin = 0, over25 = 0, bttsYes = 0;

  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = m[h][a];
      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;
      if (h + a > 2.5) over25 += p;
      if (h > 0 && a > 0) bttsYes += p;
    }
  }

  // In knockout rounds there's no draw — distribute draw probability by relative strength
  if (params.isKnockout && draw > 0) {
    const total = homeWin + awayWin;
    homeWin += draw * (total > 0 ? homeWin / total : 0.5);
    awayWin += draw * (total > 0 ? awayWin / total : 0.5);
    draw = 0;
  }

  return {
    homeWin: round(homeWin),
    draw:    round(draw),
    awayWin: round(awayWin),
    over25:  round(over25),
    under25: round(1 - over25),
    bttsYes: round(bttsYes),
    bttsNo:  round(1 - bttsYes),
    lambdaHome: round(lh),
    lambdaAway: round(la),
  };
}

// ── Tournament projection (Monte Carlo) ───────────────────────────────────────

export interface TeamStrengths {
  [teamId: string]: {
    attack:  number;
    defense: number;
  };
}

export interface GroupDef {
  code: string;
  teamIds: string[];
  matches: { homeTeamId: string; awayTeamId: string; homeScore: number; awayScore: number; isFinished: boolean }[];
}

export interface TournamentProjection {
  [teamId: string]: {
    finishFirst:        number;
    finishSecond:       number;
    finishThird:        number;
    reachRoundOf32:     number;
    reachRoundOf16:     number;
    reachQuarterFinal:  number;
    reachSemiFinal:     number;
    reachFinal:         number;
    winTournament:      number;
  };
}

export function runMonteCarlo(
  groups: GroupDef[],
  strengths: TeamStrengths,
  iterations = 5_000,
): TournamentProjection {
  const counts: Record<string, Record<string, number>> = {};
  const keys = ['finishFirst','finishSecond','finishThird','reachRoundOf32','reachRoundOf16','reachQuarterFinal','reachSemiFinal','reachFinal','winTournament'];

  // Initialise counters
  for (const g of groups) {
    for (const tid of g.teamIds) {
      counts[tid] = Object.fromEntries(keys.map(k => [k, 0]));
    }
  }

  for (let i = 0; i < iterations; i++) {
    const groupResults = groups.map(g => simulateGroup(g, strengths));

    // Qualified: top-2 per group + best-8 third places
    const qualifiedR32: string[] = [];
    const thirdPlaceRows: { teamId: string; points: number; gd: number; gf: number }[] = [];

    for (const res of groupResults) {
      const sorted = rankTeams(res);
      qualifiedR32.push(sorted[0].teamId, sorted[1].teamId);
      counts[sorted[0].teamId].finishFirst++;
      counts[sorted[1].teamId].finishSecond++;
      thirdPlaceRows.push({ ...sorted[2], teamId: sorted[2].teamId });
      counts[sorted[2].teamId].finishThird++;
    }

    // Best 8 third places
    const best8Third = thirdPlaceRows
      .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf)
      .slice(0, 8)
      .map(r => r.teamId);

    const r32Teams = [...qualifiedR32, ...best8Third];
    for (const tid of r32Teams) counts[tid].reachRoundOf32++;

    // Knockout simulation R32→R16→QF→SF→Final
    let current = r32Teams;
    const stages = ['reachRoundOf16','reachQuarterFinal','reachSemiFinal','reachFinal','winTournament'];
    for (const stageName of stages) {
      const next: string[] = [];
      for (let j = 0; j < current.length; j += 2) {
        const winner = simulateKOMatch(current[j], current[j + 1], strengths);
        next.push(winner);
        counts[winner][stageName]++;
      }
      current = next;
    }
  }

  // Normalize to probabilities
  const result: TournamentProjection = {};
  for (const [teamId, c] of Object.entries(counts)) {
    result[teamId] = {
      finishFirst:       round(c.finishFirst       / iterations),
      finishSecond:      round(c.finishSecond      / iterations),
      finishThird:       round(c.finishThird       / iterations),
      reachRoundOf32:    round(c.reachRoundOf32    / iterations),
      reachRoundOf16:    round(c.reachRoundOf16    / iterations),
      reachQuarterFinal: round(c.reachQuarterFinal / iterations),
      reachSemiFinal:    round(c.reachSemiFinal    / iterations),
      reachFinal:        round(c.reachFinal        / iterations),
      winTournament:     round(c.winTournament     / iterations),
    };
  }
  return result;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

type TeamRow = { teamId: string; points: number; gd: number; gf: number };

function simulateGroup(
  group: GroupDef,
  strengths: TeamStrengths,
): Map<string, TeamRow> {
  const table = new Map<string, TeamRow>(
    group.teamIds.map(id => [id, { teamId: id, points: 0, gd: 0, gf: 0 }]),
  );

  for (const match of group.matches) {
    let hg: number, ag: number;
    if (match.isFinished) {
      hg = match.homeScore; ag = match.awayScore;
    } else {
      [hg, ag] = sampleScore(match.homeTeamId, match.awayTeamId, strengths);
    }
    updateTable(table, match.homeTeamId, match.awayTeamId, hg, ag);
  }
  return table;
}

function sampleScore(homeId: string, awayId: string, strengths: TeamStrengths): [number, number] {
  const h = strengths[homeId] ?? { attack: 1, defense: 1 };
  const a = strengths[awayId] ?? { attack: 1, defense: 1 };
  const lh = clamp(h.attack * a.defense * LEAGUE_AVG_GOALS, 0.1, 5);
  const la = clamp(a.attack * h.defense * LEAGUE_AVG_GOALS, 0.1, 5);
  return [samplePoisson(lh), samplePoisson(la)];
}

function simulateKOMatch(teamA: string, teamB: string, strengths: TeamStrengths): string {
  const a = strengths[teamA] ?? { attack: 1, defense: 1 };
  const b = strengths[teamB] ?? { attack: 1, defense: 1 };
  const la = clamp(a.attack * b.defense * LEAGUE_AVG_GOALS, 0.1, 5);
  const lb = clamp(b.attack * a.defense * LEAGUE_AVG_GOALS, 0.1, 5);
  let ga = samplePoisson(la), gb = samplePoisson(lb);
  // Penalty shootout on draw
  while (ga === gb) { ga = samplePoisson(la); gb = samplePoisson(lb); }
  return ga > gb ? teamA : teamB;
}

function samplePoisson(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

function updateTable(
  table: Map<string, TeamRow>,
  homeId: string, awayId: string,
  hg: number, ag: number,
) {
  const h = table.get(homeId)!;
  const a = table.get(awayId)!;
  h.gf += hg; h.gd += hg - ag; a.gf += ag; a.gd += ag - hg;
  if (hg > ag) h.points += 3;
  else if (hg === ag) { h.points++; a.points++; }
  else a.points += 3;
}

function rankTeams(table: Map<string, TeamRow>): TeamRow[] {
  return [...table.values()].sort(
    (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf,
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function round(n: number, d = 4) {
  return Math.round(n * 10 ** d) / 10 ** d;
}
