export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

export interface Team {
  name: string;
  code: string;
  emoji: string;
}

export interface Score {
  home: number;
  away: number;
}

export interface Match {
  id: string;
  competition: string;
  stage: string;
  group: string;
  date: string;
  time: string;
  datetime: string;
  status: MatchStatus;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  venue: string;
  isLive: boolean;
  minute: number | null;
  isSimulated?: boolean;
}

export interface TeamStanding extends Team {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  status: 'qualified' | 'contention' | 'eliminated';
  rank: number;
}

export interface GroupStanding {
  group: string;
  standings: TeamStanding[];
}

export type TabType = 'calendar' | 'standings' | 'knockout' | 'simulator';

export interface KnockoutMatch {
  id: string;
  stage: 'R16' | 'QF' | 'SF' | 'F';
  homePlaceholder: string; // e.g., "1A"
  awayPlaceholder: string; // e.g., "2B"
  homeTeam?: Team;
  awayTeam?: Team;
  score?: Score;
  winner?: Team;
}
