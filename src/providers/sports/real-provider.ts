import axios from 'axios';
import { env } from '@/lib/env';
import type { ProviderMatch, ProviderStanding, ProviderTeam, SportsDataProvider } from '@/providers/sports/types';

export class RealSportsProvider implements SportsDataProvider {
  private readonly http = axios.create({
    baseURL: env.SPORTS_API_BASE_URL,
    timeout: 15_000,
    headers: {
      Authorization: env.SPORTS_API_KEY ? `Bearer ${env.SPORTS_API_KEY}` : undefined,
    },
  });

  async getTeams(): Promise<ProviderTeam[]> {
    const { data } = await this.http.get('/teams');
    return (data?.teams ?? []) as ProviderTeam[];
  }

  async getMatches(): Promise<ProviderMatch[]> {
    const { data } = await this.http.get('/matches');
    return (data?.matches ?? []) as ProviderMatch[];
  }

  async getLiveMatches(): Promise<ProviderMatch[]> {
    const { data } = await this.http.get('/matches/live');
    return (data?.matches ?? []) as ProviderMatch[];
  }

  async getStandings(): Promise<ProviderStanding[]> {
    const { data } = await this.http.get('/standings');
    return (data?.standings ?? []) as ProviderStanding[];
  }
}
