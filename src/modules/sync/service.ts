import { CompetitionStatus, MatchStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { getSportsProvider } from '@/providers/sports';
import { recomputeAndPersistStandings } from '@/modules/standings/service';
import { generateKnockoutFromStandings } from '@/modules/knockout/service';
import { updateCurrentStage } from '@/modules/competitions/service';

async function createSyncLog(entityType: string, provider: string) {
  const startedAt = new Date();
  const log = await prisma.syncLog.create({
    data: {
      provider,
      entityType,
      startedAt,
      success: false,
      message: 'Sync started',
    },
  });

  return {
    id: log.id,
    startedAt,
  };
}

async function finishSyncLog(logId: string, success: boolean, message: string, payloadSummary?: unknown) {
  await prisma.syncLog.update({
    where: { id: logId },
    data: {
      finishedAt: new Date(),
      success,
      message,
      payloadSummary: payloadSummary ? JSON.parse(JSON.stringify(payloadSummary)) : undefined,
    },
  });
}

export async function invalidateCacheByPrefixes(prefixes: string[]) {
  if (!redis) return;

  for (const prefix of prefixes) {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export async function syncTeams(competitionId = 'wc_2026') {
  const provider = getSportsProvider();
  const log = await createSyncLog('teams', provider.constructor.name);

  try {
    const teams = await provider.getTeams();

    for (const team of teams) {
      const group = team.groupCode
        ? await prisma.group.findFirst({
            where: { competitionId, code: team.groupCode.toUpperCase() },
          })
        : null;

      await prisma.team.upsert({
        where: { code: team.code.toUpperCase() },
        create: {
          id: `team_${team.code.toLowerCase()}`,
          code: team.code.toUpperCase(),
          name: team.name,
          shortName: team.shortName,
          emoji: team.emoji,
          confederation: team.confederation,
          groupId: group?.id,
        },
        update: {
          name: team.name,
          shortName: team.shortName,
          emoji: team.emoji,
          confederation: team.confederation,
          groupId: group?.id,
        },
      });
    }

    await finishSyncLog(log.id, true, 'Teams synced', { count: teams.length });
    return { synced: teams.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    await finishSyncLog(log.id, false, message);
    throw error;
  }
}

export async function syncMatches(competitionId = 'wc_2026', liveOnly = false) {
  const provider = getSportsProvider();
  const log = await createSyncLog(liveOnly ? 'live' : 'matches', provider.constructor.name);

  try {
    const incoming = liveOnly ? await provider.getLiveMatches() : await provider.getMatches();

    for (const match of incoming) {
      const [stage, group, homeTeam, awayTeam] = await Promise.all([
        prisma.stage.findFirst({ where: { competitionId, code: match.stageCode.toUpperCase() } }),
        match.groupCode
          ? prisma.group.findFirst({ where: { competitionId, code: match.groupCode.toUpperCase() } })
          : Promise.resolve(null),
        prisma.team.findUnique({ where: { code: match.homeTeamCode.toUpperCase() } }),
        prisma.team.findUnique({ where: { code: match.awayTeamCode.toUpperCase() } }),
      ]);

      if (!stage || !homeTeam || !awayTeam) {
        continue;
      }

      const datetimeUtc = new Date(match.datetimeUtc);
      const winnerTeamId =
        match.status === 'FINISHED'
          ? match.homeScore > match.awayScore
            ? homeTeam.id
            : match.awayScore > match.homeScore
              ? awayTeam.id
              : null
          : null;

      await prisma.match.upsert({
        where: { id: `match_ext_${match.externalId}` },
        create: {
          id: `match_ext_${match.externalId}`,
          externalId: match.externalId,
          competitionId,
          stageId: stage.id,
          groupId: group?.id,
          venue: 'TBD',
          city: 'TBD',
          country: 'TBD',
          date: new Date(datetimeUtc.toISOString().slice(0, 10)),
          time: datetimeUtc.toISOString().slice(11, 16),
          datetimeUtc,
          timezone: match.timezone,
          status: match.status as MatchStatus,
          isLive: match.isLive,
          minute: match.minute,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          winnerTeamId,
          source: provider.constructor.name,
          sourceLastSync: new Date(match.sourceLastSync),
          isOfficial: true,
        },
        update: {
          stageId: stage.id,
          groupId: group?.id,
          datetimeUtc,
          timezone: match.timezone,
          status: match.status as MatchStatus,
          isLive: match.isLive,
          minute: match.minute,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          winnerTeamId,
          sourceLastSync: new Date(match.sourceLastSync),
        },
      });
    }

    await finishSyncLog(log.id, true, liveOnly ? 'Live matches synced' : 'Matches synced', {
      count: incoming.length,
      liveOnly,
    });

    return { synced: incoming.length, liveOnly };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    await finishSyncLog(log.id, false, message);
    throw error;
  }
}

export async function syncStandings(competitionId = 'wc_2026') {
  const log = await createSyncLog('standings', 'internal');

  try {
    const standings = await recomputeAndPersistStandings(competitionId);
    await finishSyncLog(log.id, true, 'Standings recomputed', {
      count: Array.isArray(standings) ? standings.length : 0,
    });
    return standings;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    await finishSyncLog(log.id, false, message);
    throw error;
  }
}

export async function syncKnockout(competitionId = 'wc_2026') {
  const log = await createSyncLog('knockout', 'internal');

  try {
    const bracket = await generateKnockoutFromStandings(competitionId);
    await finishSyncLog(log.id, true, 'Knockout generated');
    return bracket;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    await finishSyncLog(log.id, false, message);
    throw error;
  }
}

export async function syncCompetitions(competitionId = 'wc_2026') {
  const log = await createSyncLog('competitions', 'internal');

  try {
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) throw new Error(`Competition ${competitionId} not found`);

    const now = new Date();
    let newStatus: CompetitionStatus = competition.status;

    if (now < competition.startDate) {
      newStatus = CompetitionStatus.SCHEDULED;
    } else if (now > competition.endDate) {
      newStatus = CompetitionStatus.FINISHED;
    } else {
      newStatus = CompetitionStatus.LIVE;
    }

    if (newStatus !== competition.status) {
      await prisma.competition.update({
        where: { id: competitionId },
        data: { status: newStatus },
      });
    }

    await finishSyncLog(log.id, true, 'Competition status synced', {
      competitionId,
      previousStatus: competition.status,
      newStatus,
      changed: newStatus !== competition.status,
    });

    return { competitionId, status: newStatus };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    await finishSyncLog(log.id, false, message);
    throw error;
  }
}

export async function syncCurrentStage(competitionId = 'wc_2026') {
  const log = await createSyncLog('current-stage', 'internal');

  try {
    const liveMatch = await prisma.match.findFirst({
      where: {
        competitionId,
        isLive: true,
      },
      orderBy: { datetimeUtc: 'asc' },
    });

    if (liveMatch) {
      await updateCurrentStage(competitionId, liveMatch.stageId);
      await finishSyncLog(log.id, true, 'Current stage updated from live data', {
        stageId: liveMatch.stageId,
      });
      return { stageId: liveMatch.stageId };
    }

    const hasGroupPending = await prisma.match.findFirst({
      where: {
        competitionId,
        stage: { code: 'GROUP' },
        status: { not: MatchStatus.FINISHED },
      },
    });

    const targetStageCode = hasGroupPending ? 'GROUP' : 'R32';
    const targetStage = await prisma.stage.findFirst({
      where: { competitionId, code: targetStageCode },
    });

    if (!targetStage) {
      throw new Error('Unable to resolve current stage');
    }

    await updateCurrentStage(competitionId, targetStage.id);
    await finishSyncLog(log.id, true, 'Current stage updated', {
      stageId: targetStage.id,
      stageCode: targetStageCode,
    });

    return { stageId: targetStage.id, stageCode: targetStageCode };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    await finishSyncLog(log.id, false, message);
    throw error;
  }
}
