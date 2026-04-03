import { Match, Team } from './types';

export const TEAMS: Record<string, Team> = {
  // Grupo A
  NED: { name: 'Holanda', code: 'NED', emoji: '🇳🇱' },
  SEN: { name: 'Senegal', code: 'SEN', emoji: '🇸🇳' },
  ECU: { name: 'Equador', code: 'ECU', emoji: '🇪🇨' },
  QAT: { name: 'Catar', code: 'QAT', emoji: '🇶🇦' },
  // Grupo B
  ENG: { name: 'Inglaterra', code: 'ENG', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  USA: { name: 'EUA', code: 'USA', emoji: '🇺🇸' },
  IRN: { name: 'Irã', code: 'IRN', emoji: '🇮🇷' },
  WAL: { name: 'Gales', code: 'WAL', emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  // Grupo C
  ARG: { name: 'Argentina', code: 'ARG', emoji: '🇦🇷' },
  POL: { name: 'Polônia', code: 'POL', emoji: '🇵🇱' },
  MEX: { name: 'México', code: 'MEX', emoji: '🇲🇽' },
  KSA: { name: 'Arábia Saudita', code: 'KSA', emoji: '🇸🇦' },
  // Grupo D
  FRA: { name: 'França', code: 'FRA', emoji: '🇫🇷' },
  AUS: { name: 'Austrália', code: 'AUS', emoji: '🇦🇺' },
  TUN: { name: 'Tunísia', code: '🇹🇳', emoji: '🇹🇳' },
  DEN: { name: 'Dinamarca', code: '🇩🇰', emoji: '🇩🇰' },
  // Grupo G
  BRA: { name: 'Brasil', code: 'BRA', emoji: '🇧🇷' },
  SUI: { name: 'Suíça', code: '🇨🇭', emoji: '🇨🇭' },
  CMR: { name: 'Camarões', code: '🇨🇲', emoji: '🇨🇲' },
  SRB: { name: 'Sérvia', code: '🇷🇸', emoji: '🇷🇸' },
};

export const MOCK_MATCHES: Match[] = [
  // Grupo G
  {
    id: 'g1',
    competition: 'Copa do Mundo',
    stage: 'Fase de Grupos',
    group: 'Grupo G',
    date: '2026-06-18',
    time: '16:00',
    datetime: '2026-06-18T16:00:00Z',
    status: 'scheduled',
    homeTeam: TEAMS.BRA,
    awayTeam: TEAMS.SRB,
    score: { home: 0, away: 0 },
    venue: 'Lusail Stadium',
    isLive: false,
    minute: null,
  },
  {
    id: 'g2',
    competition: 'Copa do Mundo',
    stage: 'Fase de Grupos',
    group: 'Grupo G',
    date: '2026-06-18',
    time: '13:00',
    datetime: '2026-06-18T13:00:00Z',
    status: 'scheduled',
    homeTeam: TEAMS.SUI,
    awayTeam: TEAMS.CMR,
    score: { home: 0, away: 0 },
    venue: 'Al Janoub Stadium',
    isLive: false,
    minute: null,
  },
  // Grupo C
  {
    id: 'c1',
    competition: 'Copa do Mundo',
    stage: 'Fase de Grupos',
    group: 'Grupo C',
    date: '2026-06-18',
    time: '19:00',
    datetime: '2026-06-18T19:00:00Z',
    status: 'finished',
    homeTeam: TEAMS.ARG,
    awayTeam: TEAMS.MEX,
    score: { home: 2, away: 1 },
    venue: 'Stadium 974',
    isLive: false,
    minute: null,
  },
  // Grupo D
  {
    id: 'd1',
    competition: 'Copa do Mundo',
    stage: 'Fase de Grupos',
    group: 'Grupo D',
    date: '2026-06-18',
    time: '21:00',
    datetime: '2026-06-18T21:00:00Z',
    status: 'live',
    homeTeam: TEAMS.FRA,
    awayTeam: TEAMS.DEN,
    score: { home: 1, away: 0 },
    venue: 'Al Bayt Stadium',
    isLive: true,
    minute: 65,
  },
];

export const MOCK_STANDINGS = [];
