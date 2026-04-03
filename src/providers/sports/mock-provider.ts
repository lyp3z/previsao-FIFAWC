import { prisma } from '@/lib/prisma';
import type { ProviderMatch, ProviderStanding, ProviderTeam, SportsDataProvider } from '@/providers/sports/types';

export class MockSportsProvider implements SportsDataProvider {
  async getTeams(): Promise<ProviderTeam[]> {
    const teams = await prisma.team.findMany({
      include: { group: true },
    });

    return teams.map((team) => ({
      code: team.code,
      name: team.name,
      shortName: team.shortName,
      emoji: team.emoji,
      confederation: team.confederation ?? undefined,
      groupCode: team.group?.code,
    }));
  }

  async getMatches(): Promise<ProviderMatch[]> {
    const matches = await prisma.match.findMany({
      include: {
        stage: true,
        group: true,
        homeTeam: true,
        awayTeam: true,
      },
    });

    return matches.map((match) => ({
      externalId: match.externalId ?? match.id,
      stageCode: match.stage.code,
      groupCode: match.group?.code,
      datetimeUtc: match.datetimeUtc.toISOString(),
      timezone: match.timezone,
      status: match.status,
      isLive: match.isLive,
      minute: match.minute ?? undefined,
      homeTeamCode: match.homeTeam.code,
      awayTeamCode: match.awayTeam.code,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      sourceLastSync: new Date().toISOString(),
    }));
  }

  async getLiveMatches(): Promise<ProviderMatch[]> {
    const matches = await this.getMatches();
    return matches.filter((match) => match.isLive);
  }

  async getStandings(): Promise<ProviderStanding[]> {
    const standings = await prisma.standing.findMany({
      include: {
        group: true,
        team: true,
      },
    });

    return standings.map((row) => ({
      groupCode: row.group.code,
      teamCode: row.team.code,
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      points: row.points,
    }));
  }
}
