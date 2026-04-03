export type ProviderMatch = {
  externalId: string;
  stageCode: string;
  groupCode?: string;
  datetimeUtc: string;
  timezone: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  isLive: boolean;
  minute?: number;
  homeTeamCode: string;
  awayTeamCode: string;
  homeScore: number;
  awayScore: number;
  sourceLastSync: string;
};

export type ProviderTeam = {
  code: string;
  name: string;
  shortName: string;
  emoji: string;
  confederation?: string;
  groupCode?: string;
};

export type ProviderStanding = {
  groupCode: string;
  teamCode: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export interface SportsDataProvider {
  getTeams(): Promise<ProviderTeam[]>;
  getMatches(): Promise<ProviderMatch[]>;
  getLiveMatches(): Promise<ProviderMatch[]>;
  getStandings(): Promise<ProviderStanding[]>;
}
