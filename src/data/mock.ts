// ── Types ─────────────────────────────────────────────────────────────────────

export type MatchStatus = 'LIVE' | 'FINISHED' | 'SCHEDULED';
export type QualStatus  = 'QUALIFIED' | 'PLAYOFF' | 'ELIMINATED' | 'TBD';

export interface Team {
  id: string; code: string; name: string; shortName: string; emoji: string; group: string;
}

export interface Match {
  id: string;
  homeTeam: Team; awayTeam: Team;
  homeScore: number; awayScore: number;
  status: MatchStatus;
  minute?: number;
  date: string; time: string;
  venue: string; city: string;
  stage: string; group?: string;
  roundLabel?: string;
  prediction?: MatchPrediction;
  bestOdd?: number;
  hasValueBet?: boolean;
}

export interface StandingRow {
  position: number; team: Team;
  played: number; wins: number; draws: number; losses: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number; points: number;
  qualificationStatus: QualStatus;
  form: ('W'|'D'|'L')[];
}

export interface GroupData {
  code: string; name: string;
  standings: StandingRow[];
  matches: Match[];
}

export interface MatchPrediction {
  matchId: string;
  homeWin: number; draw: number; awayWin: number;
  over25: number; under25: number;
  bttsYes: number; bttsNo: number;
  toQualifyHome?: number; toQualifyAway?: number;
  confidenceScore: number;
  model: string; version: string;
  explanation: string;
}

export interface BettingInsight {
  id: string;
  match: Match;
  market: string; marketLabel: string;
  bookmaker: string;
  selectionCode: string; selectionLabel: string;
  offeredOdd: number;
  modelProbability: number;
  impliedProbability: number;
  fairOdd: number;
  edge: number;
  expectedValue: number;
  confidenceScore: number;
  confidenceLabel: 'HIGH' | 'MEDIUM' | 'LOW';
  isValueBet: boolean;
  explanation: string;
}

export interface BookmakerOdds {
  bookmaker: string; isSharp?: boolean;
  home: number; draw: number; away: number;
  over25: number; under25: number;
  bttsYes: number; bttsNo: number;
}

export interface MatchOddsData {
  matchId: string;
  bookmakers: BookmakerOdds[];
  best: { home: number; draw: number; away: number; over25: number; under25: number; bttsYes: number };
  averageImplied: { home: number; draw: number; away: number };
  capturedAt: string;
}

export interface TeamProjection {
  teamId: string; team: Team;
  reachRoundOf32: number; reachRoundOf16: number;
  reachQuarterFinal: number; reachSemiFinal: number;
  reachFinal: number; winTournament: number;
  finishFirst: number; finishSecond: number;
}

// ── Teams ─────────────────────────────────────────────────────────────────────

const mkTeam = (id: string, code: string, name: string, shortName: string, emoji: string, group: string): Team =>
  ({ id, code, name, shortName, emoji, group });

export const TEAMS: Record<string, Team> = {
  BRA: mkTeam('team_bra', 'BRA', 'Brasil',        'Brasil',    '🇧🇷', 'C'),
  ARG: mkTeam('team_arg', 'ARG', 'Argentina',     'Argentina', '🇦🇷', 'J'),
  FRA: mkTeam('team_fra', 'FRA', 'França',        'França',    '🇫🇷', 'I'),
  ENG: mkTeam('team_eng', 'ENG', 'Inglaterra',    'Inglaterra','🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'L'),
  ESP: mkTeam('team_esp', 'ESP', 'Espanha',       'Espanha',   '🇪🇸', 'H'),
  POR: mkTeam('team_por', 'POR', 'Portugal',      'Portugal',  '🇵🇹', 'K'),
  GER: mkTeam('team_ger', 'GER', 'Alemanha',      'Alemanha',  '🇩🇪', 'E'),
  NED: mkTeam('team_ned', 'NED', 'Holanda',       'Holanda',   '🇳🇱', 'F'),
  BEL: mkTeam('team_bel', 'BEL', 'Bélgica',      'Bélgica',   '🇧🇪', 'G'),
  URU: mkTeam('team_uru', 'URU', 'Uruguai',       'Uruguai',   '🇺🇾', 'H'),
  USA: mkTeam('team_usa', 'USA', 'Estados Unidos','EUA',       '🇺🇸', 'D'),
  MEX: mkTeam('team_mex', 'MEX', 'México',        'México',    '🇲🇽', 'A'),
  CAN: mkTeam('team_can', 'CAN', 'Canadá',        'Canadá',    '🇨🇦', 'B'),
  MAR: mkTeam('team_mar', 'MAR', 'Marrocos',      'Marrocos',  '🇲🇦', 'C'),
  SEN: mkTeam('team_sen', 'SEN', 'Senegal',       'Senegal',   '🇸🇳', 'I'),
  JPN: mkTeam('team_jpn', 'JPN', 'Japão',         'Japão',     '🇯🇵', 'F'),
  KOR: mkTeam('team_kor', 'KOR', 'Coreia do Sul', 'Coreia',    '🇰🇷', 'A'),
  AUS: mkTeam('team_aus', 'AUS', 'Austrália',     'Austrália', '🇦🇺', 'D'),
  NOR: mkTeam('team_nor', 'NOR', 'Noruega',       'Noruega',   '🇳🇴', 'I'),
  CRO: mkTeam('team_cro', 'CRO', 'Croácia',       'Croácia',   '🇭🇷', 'L'),
  SCO: mkTeam('team_sco', 'SCO', 'Escócia',       'Escócia',   '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'C'),
  COL: mkTeam('team_col', 'COL', 'Colômbia',      'Colômbia',  '🇨🇴', 'K'),
};

// ── Matches ───────────────────────────────────────────────────────────────────

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1', homeTeam: TEAMS.MEX, awayTeam: TEAMS.KOR,
    homeScore: 2, awayScore: 1, status: 'LIVE', minute: 67,
    date: '2026-06-11', time: '18:00', venue: 'Estadio Azteca', city: 'Cidade do México',
    stage: 'GROUP', group: 'A', roundLabel: 'Grupo A — Rodada 1',
    prediction: { matchId: 'm1', homeWin: 0.52, draw: 0.24, awayWin: 0.24, over25: 0.61, under25: 0.39, bttsYes: 0.55, bttsNo: 0.45, confidenceScore: 0.72, model: 'poisson-v1', version: '1.0.0', explanation: 'México em casa, vantagem defensiva sólida.' },
    bestOdd: 1.85, hasValueBet: true,
  },
  {
    id: 'm2', homeTeam: TEAMS.BRA, awayTeam: TEAMS.MAR,
    homeScore: 0, awayScore: 0, status: 'SCHEDULED',
    date: '2026-06-12', time: '15:00', venue: 'AT&T Stadium', city: 'Dallas',
    stage: 'GROUP', group: 'C', roundLabel: 'Grupo C — Rodada 1',
    prediction: { matchId: 'm2', homeWin: 0.58, draw: 0.22, awayWin: 0.20, over25: 0.65, under25: 0.35, bttsYes: 0.52, bttsNo: 0.48, confidenceScore: 0.68, model: 'poisson-v1', version: '1.0.0', explanation: 'Brasil favorito pelo ataque superior.' },
    bestOdd: 1.72, hasValueBet: false,
  },
  {
    id: 'm3', homeTeam: TEAMS.FRA, awayTeam: TEAMS.SEN,
    homeScore: 0, awayScore: 0, status: 'SCHEDULED',
    date: '2026-06-12', time: '18:00', venue: 'MetLife Stadium', city: 'Nova York',
    stage: 'GROUP', group: 'I', roundLabel: 'Grupo I — Rodada 1',
    prediction: { matchId: 'm3', homeWin: 0.55, draw: 0.25, awayWin: 0.20, over25: 0.58, under25: 0.42, bttsYes: 0.48, bttsNo: 0.52, confidenceScore: 0.70, model: 'poisson-v1', version: '1.0.0', explanation: 'França com elenco superior, Senegal pode surpreender.' },
    bestOdd: 1.68, hasValueBet: true,
  },
  {
    id: 'm4', homeTeam: TEAMS.ARG, awayTeam: TEAMS.NOR,
    homeScore: 3, awayScore: 1, status: 'FINISHED',
    date: '2026-06-11', time: '21:00', venue: 'SoFi Stadium', city: 'Los Angeles',
    stage: 'GROUP', group: 'J', roundLabel: 'Grupo J — Rodada 1',
    prediction: { matchId: 'm4', homeWin: 0.61, draw: 0.22, awayWin: 0.17, over25: 0.63, under25: 0.37, bttsYes: 0.50, bttsNo: 0.50, confidenceScore: 0.74, model: 'poisson-v1', version: '1.0.0', explanation: 'Argentina com melhor ranking e forma recente.' },
    bestOdd: 1.60,
  },
  {
    id: 'm5', homeTeam: TEAMS.ENG, awayTeam: TEAMS.CRO,
    homeScore: 0, awayScore: 0, status: 'SCHEDULED',
    date: '2026-06-13', time: '15:00', venue: 'Levi\'s Stadium', city: 'San Francisco',
    stage: 'GROUP', group: 'L', roundLabel: 'Grupo L — Rodada 1',
    prediction: { matchId: 'm5', homeWin: 0.50, draw: 0.26, awayWin: 0.24, over25: 0.56, under25: 0.44, bttsYes: 0.49, bttsNo: 0.51, confidenceScore: 0.65, model: 'poisson-v1', version: '1.0.0', explanation: 'Disputa equilibrada, Croácia forte defensivamente.' },
    bestOdd: 2.10, hasValueBet: true,
  },
  {
    id: 'm6', homeTeam: TEAMS.ESP, awayTeam: TEAMS.URU,
    homeScore: 0, awayScore: 0, status: 'SCHEDULED',
    date: '2026-06-13', time: '21:00', venue: 'Hard Rock Stadium', city: 'Miami',
    stage: 'GROUP', group: 'H', roundLabel: 'Grupo H — Rodada 1',
    prediction: { matchId: 'm6', homeWin: 0.54, draw: 0.24, awayWin: 0.22, over25: 0.60, under25: 0.40, bttsYes: 0.53, bttsNo: 0.47, confidenceScore: 0.69, model: 'poisson-v1', version: '1.0.0', explanation: 'Espanha favorita pelo toque de bola superior.' },
    bestOdd: 1.75,
  },
];

// ── Groups ────────────────────────────────────────────────────────────────────

const mkRow = (pos: number, team: Team, p: number, w: number, d: number, l: number, gf: number, ga: number, pts: number, qs: QualStatus, form: ('W'|'D'|'L')[]): StandingRow =>
  ({ position: pos, team, played: p, wins: w, draws: d, losses: l, goalsFor: gf, goalsAgainst: ga, goalDifference: gf - ga, points: pts, qualificationStatus: qs, form });

export const MOCK_GROUPS: GroupData[] = [
  {
    code: 'A', name: 'Grupo A',
    standings: [
      mkRow(1, TEAMS.MEX, 2, 1, 1, 0, 3, 1, 4, 'QUALIFIED', ['W','D']),
      mkRow(2, TEAMS.KOR, 2, 0, 2, 0, 2, 2, 2, 'TBD', ['D','D']),
      mkRow(3, {id:'team_rsa',code:'RSA',name:'África do Sul',shortName:'África do Sul',emoji:'🇿🇦',group:'A'}, 2, 0, 1, 1, 1, 2, 1, 'TBD', ['L','D']),
      mkRow(4, {id:'team_cze',code:'CZE',name:'República Tcheca',shortName:'R. Tcheca',emoji:'🇨🇿',group:'A'}, 2, 0, 0, 2, 0, 3, 0, 'ELIMINATED', ['L','L']),
    ],
    matches: [MOCK_MATCHES[0]],
  },
  {
    code: 'C', name: 'Grupo C',
    standings: [
      mkRow(1, TEAMS.BRA,  1, 1, 0, 0, 2, 0, 3, 'TBD', ['W']),
      mkRow(2, TEAMS.MAR,  1, 0, 1, 0, 1, 1, 1, 'TBD', ['D']),
      mkRow(3, TEAMS.SCO,  1, 0, 1, 0, 1, 1, 1, 'TBD', ['D']),
      mkRow(4, {id:'team_hai',code:'HAI',name:'Haiti',shortName:'Haiti',emoji:'🇭🇹',group:'C'}, 1, 0, 0, 1, 0, 2, 0, 'TBD', ['L']),
    ],
    matches: [MOCK_MATCHES[1]],
  },
  {
    code: 'J', name: 'Grupo J',
    standings: [
      mkRow(1, TEAMS.ARG, 1, 1, 0, 0, 3, 1, 3, 'TBD', ['W']),
      mkRow(2, {id:'team_alg',code:'ALG',name:'Argélia',shortName:'Argélia',emoji:'🇩🇿',group:'J'}, 1, 0, 1, 0, 0, 0, 1, 'TBD', ['D']),
      mkRow(3, {id:'team_aut',code:'AUT',name:'Áustria',shortName:'Áustria',emoji:'🇦🇹',group:'J'}, 1, 0, 1, 0, 0, 0, 1, 'TBD', ['D']),
      mkRow(4, TEAMS.NOR, 1, 0, 0, 1, 1, 3, 0, 'TBD', ['L']),
    ],
    matches: [MOCK_MATCHES[3]],
  },
];

// ── Predictions ───────────────────────────────────────────────────────────────

export const MOCK_PREDICTIONS: MatchPrediction[] = MOCK_MATCHES
  .filter(m => m.prediction)
  .map(m => m.prediction!);

// ── Projections ───────────────────────────────────────────────────────────────

export const MOCK_PROJECTIONS: TeamProjection[] = [
  { teamId:'team_bra', team: TEAMS.BRA, reachRoundOf32:0.96, reachRoundOf16:0.78, reachQuarterFinal:0.62, reachSemiFinal:0.46, reachFinal:0.32, winTournament:0.16, finishFirst:0.72, finishSecond:0.24 },
  { teamId:'team_fra', team: TEAMS.FRA, reachRoundOf32:0.94, reachRoundOf16:0.76, reachQuarterFinal:0.60, reachSemiFinal:0.44, reachFinal:0.30, winTournament:0.14, finishFirst:0.68, finishSecond:0.26 },
  { teamId:'team_arg', team: TEAMS.ARG, reachRoundOf32:0.93, reachRoundOf16:0.74, reachQuarterFinal:0.58, reachSemiFinal:0.42, reachFinal:0.28, winTournament:0.13, finishFirst:0.65, finishSecond:0.28 },
  { teamId:'team_eng', team: TEAMS.ENG, reachRoundOf32:0.90, reachRoundOf16:0.70, reachQuarterFinal:0.52, reachSemiFinal:0.36, reachFinal:0.22, winTournament:0.10, finishFirst:0.58, finishSecond:0.32 },
  { teamId:'team_esp', team: TEAMS.ESP, reachRoundOf32:0.91, reachRoundOf16:0.72, reachQuarterFinal:0.55, reachSemiFinal:0.38, reachFinal:0.24, winTournament:0.11, finishFirst:0.60, finishSecond:0.31 },
  { teamId:'team_por', team: TEAMS.POR, reachRoundOf32:0.88, reachRoundOf16:0.68, reachQuarterFinal:0.49, reachSemiFinal:0.32, reachFinal:0.18, winTournament:0.08, finishFirst:0.55, finishSecond:0.33 },
  { teamId:'team_ger', team: TEAMS.GER, reachRoundOf32:0.88, reachRoundOf16:0.67, reachQuarterFinal:0.48, reachSemiFinal:0.31, reachFinal:0.17, winTournament:0.07, finishFirst:0.52, finishSecond:0.36 },
  { teamId:'team_ned', team: TEAMS.NED, reachRoundOf32:0.85, reachRoundOf16:0.62, reachQuarterFinal:0.43, reachSemiFinal:0.27, reachFinal:0.14, winTournament:0.06, finishFirst:0.48, finishSecond:0.37 },
];

// ── Odds ──────────────────────────────────────────────────────────────────────

export const MOCK_ODDS: MatchOddsData[] = [
  {
    matchId: 'm2',
    bookmakers: [
      { bookmaker: 'Pinnacle', isSharp: true, home: 1.70, draw: 3.60, away: 4.50, over25: 1.80, under25: 2.05, bttsYes: 1.88, bttsNo: 1.95 },
      { bookmaker: 'Bet365',              home: 1.72, draw: 3.50, away: 4.40, over25: 1.83, under25: 2.00, bttsYes: 1.90, bttsNo: 1.90 },
      { bookmaker: 'Unibet',              home: 1.68, draw: 3.55, away: 4.35, over25: 1.78, under25: 2.10, bttsYes: 1.85, bttsNo: 1.98 },
    ],
    best: { home: 1.72, draw: 3.60, away: 4.50, over25: 1.83, under25: 2.10, bttsYes: 1.90 },
    averageImplied: { home: 0.589, draw: 0.279, away: 0.226 },
    capturedAt: '2026-06-12T06:00:00Z',
  },
  {
    matchId: 'm5',
    bookmakers: [
      { bookmaker: 'Pinnacle', isSharp: true, home: 2.08, draw: 3.40, away: 3.35, over25: 1.75, under25: 2.10, bttsYes: 1.78, bttsNo: 2.05 },
      { bookmaker: 'Bet365',              home: 2.10, draw: 3.30, away: 3.30, over25: 1.77, under25: 2.05, bttsYes: 1.80, bttsNo: 2.00 },
      { bookmaker: 'Unibet',              home: 2.05, draw: 3.35, away: 3.25, over25: 1.72, under25: 2.15, bttsYes: 1.75, bttsNo: 2.08 },
    ],
    best: { home: 2.10, draw: 3.40, away: 3.35, over25: 1.77, under25: 2.15, bttsYes: 1.80 },
    averageImplied: { home: 0.483, draw: 0.296, away: 0.301 },
    capturedAt: '2026-06-12T06:00:00Z',
  },
];

// ── Betting Insights ──────────────────────────────────────────────────────────

export const MOCK_INSIGHTS: BettingInsight[] = [
  {
    id: 'bi1', match: MOCK_MATCHES[0],
    market: '1X2', marketLabel: '1X2', bookmaker: 'Unibet',
    selectionCode: 'HOME', selectionLabel: 'México', offeredOdd: 2.10,
    modelProbability: 0.52, impliedProbability: 0.476, fairOdd: 1.92,
    edge: 0.044, expectedValue: 0.092, confidenceScore: 0.72,
    confidenceLabel: 'HIGH', isValueBet: true,
    explanation: 'Modelo vê 52% de chance para México, mercado precifica 47.6%. Edge de 4.4%, EV positivo.',
  },
  {
    id: 'bi2', match: MOCK_MATCHES[2],
    market: '1X2', marketLabel: '1X2', bookmaker: 'Bet365',
    selectionCode: 'AWAY', selectionLabel: 'Senegal', offeredOdd: 4.50,
    modelProbability: 0.26, impliedProbability: 0.222, fairOdd: 3.85,
    edge: 0.038, expectedValue: 0.170, confidenceScore: 0.61,
    confidenceLabel: 'MEDIUM', isValueBet: true,
    explanation: 'Senegal sub-cotado. Modelo atribui 26% de chance vs 22.2% do mercado. EV de 17%.',
  },
  {
    id: 'bi3', match: MOCK_MATCHES[4],
    market: 'OU_25', marketLabel: 'Over/Under 2.5', bookmaker: 'Pinnacle',
    selectionCode: 'OVER_25', selectionLabel: 'Acima de 2.5 gols', offeredOdd: 1.75,
    modelProbability: 0.62, impliedProbability: 0.571, fairOdd: 1.61,
    edge: 0.049, expectedValue: 0.085, confidenceScore: 0.68,
    confidenceLabel: 'HIGH', isValueBet: true,
    explanation: 'Partida ofensiva esperada. Ambas seleções com média > 1.8 gols. Over 2.5 sub-pricificado.',
  },
  {
    id: 'bi4', match: MOCK_MATCHES[1],
    market: 'BTTS', marketLabel: 'Ambas Marcam', bookmaker: 'Unibet',
    selectionCode: 'BTTS_YES', selectionLabel: 'Ambas marcam — Sim', offeredOdd: 1.98,
    modelProbability: 0.55, impliedProbability: 0.505, fairOdd: 1.82,
    edge: 0.045, expectedValue: 0.089, confidenceScore: 0.65,
    confidenceLabel: 'MEDIUM', isValueBet: true,
    explanation: 'Brasil e Marrocos têm ataques potentes. Modelos sugerem 55% de BTTS vs 50.5% implícito.',
  },
  {
    id: 'bi5', match: MOCK_MATCHES[5],
    market: 'DC', marketLabel: 'Dupla Chance', bookmaker: 'Bet365',
    selectionCode: 'DC_X2', selectionLabel: 'Empate ou Uruguai', offeredOdd: 2.20,
    modelProbability: 0.48, impliedProbability: 0.455, fairOdd: 2.08,
    edge: 0.025, expectedValue: 0.056, confidenceScore: 0.55,
    confidenceLabel: 'MEDIUM', isValueBet: false,
    explanation: 'Uruguai defensivamente sólido, empate possível contra Espanha. Edge moderado.',
  },
];

// ── Stats ─────────────────────────────────────────────────────────────────────

export const MOCK_STATS = {
  totalMatches:   64,
  matchesPlayed:   5,
  matchesLive:     1,
  matchesToday:    4,
  topValueBets:    4,
  avgEdge:         0.042,
  bestEV:          0.170,
};
