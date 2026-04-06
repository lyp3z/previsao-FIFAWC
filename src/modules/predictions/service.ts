import { prisma } from '@/lib/prisma';
import { MatchStatus } from '@prisma/client';
import {
  predictMatch, runMonteCarlo,
  MODEL_NAME, MODEL_VERSION,
  GroupDef, TeamStrengths,
} from './engine';

// ── Bootstrap active model ────────────────────────────────────────────────────

export async function ensureActiveModel() {
  return prisma.predictionModel.upsert({
    where: { name_version: { name: MODEL_NAME, version: MODEL_VERSION } },
    create: {
      name: MODEL_NAME,
      version: MODEL_VERSION,
      description: 'Poisson model with attack/defense strength from in-tournament stats',
      isActive: true,
    },
    update: { isActive: true },
  });
}

// ── Match predictions ─────────────────────────────────────────────────────────

/**
 * Generates MatchPrediction for every SCHEDULED match in the competition.
 */
export async function computeMatchPredictions(competitionId: string) {
  const model = await ensureActiveModel();

  const [matches, statsRows] = await Promise.all([
    prisma.match.findMany({
      where: { competitionId, status: MatchStatus.SCHEDULED },
      include: { stage: { select: { type: true } } },
    }),
    prisma.teamStatsSnapshot.findMany({ where: { competitionId } }),
  ]);

  const statsMap = new Map(statsRows.map(s => [s.teamId, s]));

  let upserted = 0;
  for (const m of matches) {
    const h = statsMap.get(m.homeTeamId);
    const a = statsMap.get(m.awayTeamId);

    const outcome = predictMatch({
      homeAttack:   h?.attackStrength  ?? 1,
      homeDefense:  h?.defenseStrength ?? 1,
      awayAttack:   a?.attackStrength  ?? 1,
      awayDefense:  a?.defenseStrength ?? 1,
      isKnockout:   m.stage.type === 'KNOCKOUT',
    });

    // Confidence: higher when we have actual data for both teams
    const hasData = (h?.matchesPlayed ?? 0) + (a?.matchesPlayed ?? 0);
    const confidenceScore = Math.min(0.3 + hasData * 0.05, 1);

    const explanation =
      `λ_home=${outcome.lambdaHome}, λ_away=${outcome.lambdaAway}. ` +
      `Attack: ${h?.attackStrength ?? 1} vs ${a?.attackStrength ?? 1}. ` +
      `Defense: ${h?.defenseStrength ?? 1} vs ${a?.defenseStrength ?? 1}.`;

    await prisma.matchPrediction.upsert({
      where: { matchId: m.id },
      create: {
        matchId: m.id, modelId: model.id, modelVersion: MODEL_VERSION,
        homeWinProbability: outcome.homeWin,
        drawProbability:    outcome.draw,
        awayWinProbability: outcome.awayWin,
        over25Probability:  outcome.over25,
        under25Probability: outcome.under25,
        bttsYesProbability: outcome.bttsYes,
        bttsNoProbability:  outcome.bttsNo,
        confidenceScore, explanation,
      },
      update: {
        homeWinProbability: outcome.homeWin,
        drawProbability:    outcome.draw,
        awayWinProbability: outcome.awayWin,
        over25Probability:  outcome.over25,
        under25Probability: outcome.under25,
        bttsYesProbability: outcome.bttsYes,
        bttsNoProbability:  outcome.bttsNo,
        confidenceScore, explanation,
        modelVersion: MODEL_VERSION,
      },
    });
    upserted++;
  }

  return { predictionsUpserted: upserted };
}

// ── Tournament projections (Monte Carlo) ──────────────────────────────────────

export async function computeProjections(competitionId: string, iterations = 5_000) {
  const model = await ensureActiveModel();

  const [groups, statsRows, matches] = await Promise.all([
    prisma.group.findMany({
      where: { competitionId },
      include: { teams: { select: { id: true } } },
    }),
    prisma.teamStatsSnapshot.findMany({ where: { competitionId } }),
    prisma.match.findMany({
      where: { competitionId, groupId: { not: null } },
      select: {
        homeTeamId: true, awayTeamId: true,
        homeScore: true, awayScore: true,
        status: true, groupId: true,
      },
    }),
  ]);

  const statsMap = new Map(statsRows.map(s => [s.teamId, s]));

  const strengths: TeamStrengths = {};
  for (const s of statsRows) {
    strengths[s.teamId] = { attack: s.attackStrength, defense: s.defenseStrength };
  }

  const groupDefs: GroupDef[] = groups.map(g => ({
    code: g.code,
    teamIds: g.teams.map(t => t.id),
    matches: matches
      .filter(m => m.groupId === g.id)
      .map(m => ({
        homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId,
        homeScore: m.homeScore, awayScore: m.awayScore,
        isFinished: m.status === MatchStatus.FINISHED || m.status === MatchStatus.LIVE,
      })),
  }));

  const projections = runMonteCarlo(groupDefs, strengths, iterations);

  for (const [teamId, proj] of Object.entries(projections)) {
    const data = {
      finishFirstProbability:       proj.finishFirst,
      finishSecondProbability:      proj.finishSecond,
      finishThirdProbability:       proj.finishThird,
      reachRoundOf32Probability:    proj.reachRoundOf32,
      reachRoundOf16Probability:    proj.reachRoundOf16,
      reachQuarterFinalProbability: proj.reachQuarterFinal,
      reachSemiFinalProbability:    proj.reachSemiFinal,
      reachFinalProbability:        proj.reachFinal,
      winTournamentProbability:     proj.winTournament,
    };
    await prisma.teamTournamentProjection.upsert({
      where: { teamId_competitionId_modelId: { teamId, competitionId, modelId: model.id } },
      create: { teamId, competitionId, modelId: model.id, ...data },
      update: data,
    });
  }

  return { projectionsUpserted: Object.keys(projections).length };
}

// ── Read helpers ──────────────────────────────────────────────────────────────

export async function getMatchPrediction(matchId: string) {
  return prisma.matchPrediction.findUnique({
    where: { matchId },
    include: { model: { select: { name: true, version: true } } },
  });
}

export async function getTeamProjection(teamId: string, competitionId: string) {
  return prisma.teamTournamentProjection.findFirst({
    where: { teamId, competitionId },
    include: { model: { select: { name: true, version: true } } },
    orderBy: { updatedAt: 'desc' },
  });
}
