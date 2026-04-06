import 'dotenv/config';
import {
  CompetitionStatus,
  MatchStatus,
  PrismaClient,
  QualificationStatus,
  StageType,
} from '@prisma/client';

const prisma = new PrismaClient();

const competitionId = 'wc_2026';

const stages = [
  { id: 'stage_group', code: 'GROUP', name: 'Group Stage', type: StageType.GROUP, order: 1, isCurrent: true },
  { id: 'stage_r32', code: 'R32', name: 'Round of 32', type: StageType.KNOCKOUT, order: 2, isCurrent: false },
  { id: 'stage_r16', code: 'R16', name: 'Round of 16', type: StageType.KNOCKOUT, order: 3, isCurrent: false },
  { id: 'stage_qf', code: 'QF', name: 'Quarter-finals', type: StageType.KNOCKOUT, order: 4, isCurrent: false },
  { id: 'stage_sf', code: 'SF', name: 'Semi-finals', type: StageType.KNOCKOUT, order: 5, isCurrent: false },
  { id: 'stage_third', code: 'THIRD', name: 'Third place', type: StageType.POSITIONAL, order: 6, isCurrent: false },
  { id: 'stage_final', code: 'FINAL', name: 'Final', type: StageType.KNOCKOUT, order: 7, isCurrent: false },
];

const groups = 'ABCDEFGHIJKL'.split('').map((code, idx) => ({
  id: `group_${code.toLowerCase()}`,
  competitionId,
  code,
  name: `Group ${code}`,
  order: idx + 1,
}));

type TeamSeed = {
  id: string;
  name: string;
  shortName: string;
  code: string;
  emoji: string;
  confederation: string;
  groupCode: string;
};

const teams: TeamSeed[] = [
  // Grupo A
  { id: 'team_mex', name: 'México', shortName: 'México', code: 'MEX', emoji: '🇲🇽', confederation: 'CONCACAF', groupCode: 'A' },
  { id: 'team_rsa', name: 'África do Sul', shortName: 'África do Sul', code: 'RSA', emoji: '🇿🇦', confederation: 'CAF', groupCode: 'A' },
  { id: 'team_kor', name: 'Coreia do Sul', shortName: 'Coreia do Sul', code: 'KOR', emoji: '🇰🇷', confederation: 'AFC', groupCode: 'A' },
  { id: 'team_cze', name: 'Tchéquia', shortName: 'Tchéquia', code: 'CZE', emoji: '🇨🇿', confederation: 'UEFA', groupCode: 'A' },

  // Grupo B
  { id: 'team_can', name: 'Canadá', shortName: 'Canadá', code: 'CAN', emoji: '🇨🇦', confederation: 'CONCACAF', groupCode: 'B' },
  { id: 'team_bih', name: 'Bósnia e Herzegovina', shortName: 'Bósnia e Herz.', code: 'BIH', emoji: '🇧🇦', confederation: 'UEFA', groupCode: 'B' },
  { id: 'team_qat', name: 'Catar', shortName: 'Catar', code: 'QAT', emoji: '🇶🇦', confederation: 'AFC', groupCode: 'B' },
  { id: 'team_sui', name: 'Suíça', shortName: 'Suíça', code: 'SUI', emoji: '🇨🇭', confederation: 'UEFA', groupCode: 'B' },

  // Grupo C
  { id: 'team_bra', name: 'Brasil', shortName: 'Brasil', code: 'BRA', emoji: '🇧🇷', confederation: 'CONMEBOL', groupCode: 'C' },
  { id: 'team_mar', name: 'Marrocos', shortName: 'Marrocos', code: 'MAR', emoji: '🇲🇦', confederation: 'CAF', groupCode: 'C' },
  { id: 'team_hai', name: 'Haiti', shortName: 'Haiti', code: 'HAI', emoji: '🇭🇹', confederation: 'CONCACAF', groupCode: 'C' },
  { id: 'team_sco', name: 'Escócia', shortName: 'Escócia', code: 'SCO', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA', groupCode: 'C' },

  // Grupo D
  { id: 'team_usa', name: 'Estados Unidos', shortName: 'Estados Unidos', code: 'USA', emoji: '🇺🇸', confederation: 'CONCACAF', groupCode: 'D' },
  { id: 'team_par', name: 'Paraguai', shortName: 'Paraguai', code: 'PAR', emoji: '🇵🇾', confederation: 'CONMEBOL', groupCode: 'D' },
  { id: 'team_aus', name: 'Austrália', shortName: 'Austrália', code: 'AUS', emoji: '🇦🇺', confederation: 'AFC', groupCode: 'D' },
  { id: 'team_tur', name: 'Turquia', shortName: 'Turquia', code: 'TUR', emoji: '🇹🇷', confederation: 'UEFA', groupCode: 'D' },

  // Grupo E
  { id: 'team_ger', name: 'Alemanha', shortName: 'Alemanha', code: 'GER', emoji: '🇩🇪', confederation: 'UEFA', groupCode: 'E' },
  { id: 'team_cuw', name: 'Curaçao', shortName: 'Curaçao', code: 'CUW', emoji: '🇨🇼', confederation: 'CONCACAF', groupCode: 'E' },
  { id: 'team_civ', name: 'Costa do Marfim', shortName: 'Costa do Marfim', code: 'CIV', emoji: '🇨🇮', confederation: 'CAF', groupCode: 'E' },
  { id: 'team_ecu', name: 'Equador', shortName: 'Equador', code: 'ECU', emoji: '🇪🇨', confederation: 'CONMEBOL', groupCode: 'E' },

  // Grupo F
  { id: 'team_ned', name: 'Holanda', shortName: 'Holanda', code: 'NED', emoji: '🇳🇱', confederation: 'UEFA', groupCode: 'F' },
  { id: 'team_jpn', name: 'Japão', shortName: 'Japão', code: 'JPN', emoji: '🇯🇵', confederation: 'AFC', groupCode: 'F' },
  { id: 'team_swe', name: 'Suécia', shortName: 'Suécia', code: 'SWE', emoji: '🇸🇪', confederation: 'UEFA', groupCode: 'F' },
  { id: 'team_tun', name: 'Tunísia', shortName: 'Tunísia', code: 'TUN', emoji: '🇹🇳', confederation: 'CAF', groupCode: 'F' },

  // Grupo G
  { id: 'team_bel', name: 'Bélgica', shortName: 'Bélgica', code: 'BEL', emoji: '🇧🇪', confederation: 'UEFA', groupCode: 'G' },
  { id: 'team_egy', name: 'Egito', shortName: 'Egito', code: 'EGY', emoji: '🇪🇬', confederation: 'CAF', groupCode: 'G' },
  { id: 'team_irn', name: 'Irã', shortName: 'Irã', code: 'IRN', emoji: '🇮🇷', confederation: 'AFC', groupCode: 'G' },
  { id: 'team_nzl', name: 'Nova Zelândia', shortName: 'Nova Zelândia', code: 'NZL', emoji: '🇳🇿', confederation: 'OFC', groupCode: 'G' },

  // Grupo H
  { id: 'team_esp', name: 'Espanha', shortName: 'Espanha', code: 'ESP', emoji: '🇪🇸', confederation: 'UEFA', groupCode: 'H' },
  { id: 'team_cpv', name: 'Cabo Verde', shortName: 'Cabo Verde', code: 'CPV', emoji: '🇨🇻', confederation: 'CAF', groupCode: 'H' },
  { id: 'team_ksa', name: 'Arábia Saudita', shortName: 'Arábia Saudita', code: 'KSA', emoji: '🇸🇦', confederation: 'AFC', groupCode: 'H' },
  { id: 'team_uru', name: 'Uruguai', shortName: 'Uruguai', code: 'URU', emoji: '🇺🇾', confederation: 'CONMEBOL', groupCode: 'H' },

  // Grupo I
  { id: 'team_fra', name: 'França', shortName: 'França', code: 'FRA', emoji: '🇫🇷', confederation: 'UEFA', groupCode: 'I' },
  { id: 'team_sen', name: 'Senegal', shortName: 'Senegal', code: 'SEN', emoji: '🇸🇳', confederation: 'CAF', groupCode: 'I' },
  { id: 'team_irq', name: 'Iraque', shortName: 'Iraque', code: 'IRQ', emoji: '🇮🇶', confederation: 'AFC', groupCode: 'I' },
  { id: 'team_nor', name: 'Noruega', shortName: 'Noruega', code: 'NOR', emoji: '🇳🇴', confederation: 'UEFA', groupCode: 'I' },

  // Grupo J
  { id: 'team_arg', name: 'Argentina', shortName: 'Argentina', code: 'ARG', emoji: '🇦🇷', confederation: 'CONMEBOL', groupCode: 'J' },
  { id: 'team_alg', name: 'Argélia', shortName: 'Argélia', code: 'ALG', emoji: '🇩🇿', confederation: 'CAF', groupCode: 'J' },
  { id: 'team_aut', name: 'Áustria', shortName: 'Áustria', code: 'AUT', emoji: '🇦🇹', confederation: 'UEFA', groupCode: 'J' },
  { id: 'team_jor', name: 'Jordânia', shortName: 'Jordânia', code: 'JOR', emoji: '🇯🇴', confederation: 'AFC', groupCode: 'J' },

  // Grupo K
  { id: 'team_por', name: 'Portugal', shortName: 'Portugal', code: 'POR', emoji: '🇵🇹', confederation: 'UEFA', groupCode: 'K' },
  { id: 'team_cod', name: 'RD Congo', shortName: 'RD Congo', code: 'COD', emoji: '🇨🇩', confederation: 'CAF', groupCode: 'K' },
  { id: 'team_uzb', name: 'Uzbequistão', shortName: 'Uzbequistão', code: 'UZB', emoji: '🇺🇿', confederation: 'AFC', groupCode: 'K' },
  { id: 'team_col', name: 'Colômbia', shortName: 'Colômbia', code: 'COL', emoji: '🇨🇴', confederation: 'CONMEBOL', groupCode: 'K' },

  // Grupo L
  { id: 'team_eng', name: 'Inglaterra', shortName: 'Inglaterra', code: 'ENG', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA', groupCode: 'L' },
  { id: 'team_cro', name: 'Croácia', shortName: 'Croácia', code: 'CRO', emoji: '🇭🇷', confederation: 'UEFA', groupCode: 'L' },
  { id: 'team_gha', name: 'Gana', shortName: 'Gana', code: 'GHA', emoji: '🇬🇭', confederation: 'CAF', groupCode: 'L' },
  { id: 'team_pan', name: 'Panamá', shortName: 'Panamá', code: 'PAN', emoji: '🇵🇦', confederation: 'CONCACAF', groupCode: 'L' },
];

function groupFixtures(teamIds: string[]) {
  return [
    [teamIds[0], teamIds[1]],
    [teamIds[2], teamIds[3]],
    [teamIds[0], teamIds[2]],
    [teamIds[1], teamIds[3]],
    [teamIds[0], teamIds[3]],
    [teamIds[1], teamIds[2]],
  ];
}

async function main() {
  await prisma.standing.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.knockoutSlot.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.stage.deleteMany({});
  await prisma.competition.deleteMany({});

  await prisma.competition.create({
    data: {
      id: competitionId,
      slug: 'fifa-world-cup-2026',
      name: 'FIFA World Cup 2026',
      year: 2026,
      official: true,
      hostCountries: ['Canada', 'Mexico', 'United States'],
      startDate: new Date('2026-06-11T00:00:00.000Z'),
      endDate: new Date('2026-07-19T00:00:00.000Z'),
      status: CompetitionStatus.SCHEDULED,
      source: 'seed',
    },
  });

  await prisma.stage.createMany({
    data: stages.map((stage) => ({ ...stage, competitionId })),
  });

  await prisma.competition.update({
    where: { id: competitionId },
    data: { currentStageId: 'stage_group' },
  });

  await prisma.group.createMany({ data: groups });

  const groupMap = Object.fromEntries(groups.map((group) => [group.code, group.id]));

  await prisma.team.createMany({
    data: teams.map((team) => ({
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      code: team.code,
      emoji: team.emoji,
      confederation: team.confederation,
      groupId: groupMap[team.groupCode],
    })),
  });

  const byGroup = groups.map((group) => ({
    group,
    teamIds: teams.filter((team) => team.groupCode === group.code).map((team) => team.id),
  }));

  // Slot: [iso, venue, city, country] — 6 slots per group (fixtureIndex 0..5)
  // MD1 = fixtures 0,1 | MD2 = fixtures 2,3 | MD3 = fixtures 4,5 (simultaneous within group)
  type Slot = { iso: string; venue: string; city: string; country: string };
  const groupSlots: Record<string, Slot[]> = {
    A: [
      { iso: '2026-06-11T22:00:00Z', venue: 'Estadio Azteca',          city: 'Cidade do México', country: 'México' },
      { iso: '2026-06-12T01:00:00Z', venue: 'AT&T Stadium',             city: 'Dallas',           country: 'Estados Unidos' },
      { iso: '2026-06-18T23:00:00Z', venue: 'Estadio BBVA',             city: 'Monterrey',        country: 'México' },
      { iso: '2026-06-19T02:00:00Z', venue: 'Rose Bowl',                city: 'Los Angeles',      country: 'Estados Unidos' },
      { iso: '2026-06-25T22:00:00Z', venue: 'Estadio Akron',            city: 'Guadalajara',      country: 'México' },
      { iso: '2026-06-25T22:00:00Z', venue: 'AT&T Stadium',             city: 'Dallas',           country: 'Estados Unidos' },
    ],
    B: [
      { iso: '2026-06-12T19:00:00Z', venue: 'BMO Field',                city: 'Toronto',          country: 'Canadá' },
      { iso: '2026-06-12T22:00:00Z', venue: 'MetLife Stadium',          city: 'Nova York/NJ',     country: 'Estados Unidos' },
      { iso: '2026-06-19T19:00:00Z', venue: 'BC Place',                 city: 'Vancouver',        country: 'Canadá' },
      { iso: '2026-06-19T22:00:00Z', venue: 'Gillette Stadium',         city: 'Boston',           country: 'Estados Unidos' },
      { iso: '2026-06-25T19:00:00Z', venue: 'BMO Field',                city: 'Toronto',          country: 'Canadá' },
      { iso: '2026-06-25T19:00:00Z', venue: 'BC Place',                 city: 'Vancouver',        country: 'Canadá' },
    ],
    C: [
      { iso: '2026-06-12T16:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami',            country: 'Estados Unidos' },
      { iso: '2026-06-12T19:00:00Z', venue: 'MetLife Stadium',          city: 'Nova York/NJ',     country: 'Estados Unidos' },
      { iso: '2026-06-19T16:00:00Z', venue: 'Lincoln Financial Field',  city: 'Filadélfia',       country: 'Estados Unidos' },
      { iso: '2026-06-19T19:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta',          country: 'Estados Unidos' },
      { iso: '2026-06-26T22:00:00Z', venue: 'MetLife Stadium',          city: 'Nova York/NJ',     country: 'Estados Unidos' },
      { iso: '2026-06-26T22:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami',            country: 'Estados Unidos' },
    ],
    D: [
      { iso: '2026-06-13T02:00:00Z', venue: 'SoFi Stadium',             city: 'Los Angeles',      country: 'Estados Unidos' },
      { iso: '2026-06-13T00:00:00Z', venue: 'NRG Stadium',              city: 'Houston',          country: 'Estados Unidos' },
      { iso: '2026-06-20T02:00:00Z', venue: "Levi's Stadium",           city: 'São Francisco',    country: 'Estados Unidos' },
      { iso: '2026-06-20T00:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City',      country: 'Estados Unidos' },
      { iso: '2026-06-26T02:00:00Z', venue: 'MetLife Stadium',          city: 'Nova York/NJ',     country: 'Estados Unidos' },
      { iso: '2026-06-26T02:00:00Z', venue: 'SoFi Stadium',             city: 'Los Angeles',      country: 'Estados Unidos' },
    ],
    E: [
      { iso: '2026-06-13T19:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta',          country: 'Estados Unidos' },
      { iso: '2026-06-13T22:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City',      country: 'Estados Unidos' },
      { iso: '2026-06-20T19:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami',            country: 'Estados Unidos' },
      { iso: '2026-06-20T22:00:00Z', venue: 'NRG Stadium',              city: 'Houston',          country: 'Estados Unidos' },
      { iso: '2026-06-27T02:00:00Z', venue: 'SoFi Stadium',             city: 'Los Angeles',      country: 'Estados Unidos' },
      { iso: '2026-06-27T02:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City',      country: 'Estados Unidos' },
    ],
    F: [
      { iso: '2026-06-14T02:00:00Z', venue: 'Rose Bowl',                city: 'Los Angeles',      country: 'Estados Unidos' },
      { iso: '2026-06-14T00:00:00Z', venue: "Levi's Stadium",           city: 'São Francisco',    country: 'Estados Unidos' },
      { iso: '2026-06-21T02:00:00Z', venue: 'SoFi Stadium',             city: 'Los Angeles',      country: 'Estados Unidos' },
      { iso: '2026-06-21T00:00:00Z', venue: 'BC Place',                 city: 'Vancouver',        country: 'Canadá' },
      { iso: '2026-06-27T02:00:00Z', venue: 'Rose Bowl',                city: 'Los Angeles',      country: 'Estados Unidos' },
      { iso: '2026-06-27T02:00:00Z', venue: "Levi's Stadium",           city: 'São Francisco',    country: 'Estados Unidos' },
    ],
    G: [
      { iso: '2026-06-14T19:00:00Z', venue: 'Gillette Stadium',         city: 'Boston',           country: 'Estados Unidos' },
      { iso: '2026-06-14T22:00:00Z', venue: 'Lincoln Financial Field',  city: 'Filadélfia',       country: 'Estados Unidos' },
      { iso: '2026-06-21T19:00:00Z', venue: 'MetLife Stadium',          city: 'Nova York/NJ',     country: 'Estados Unidos' },
      { iso: '2026-06-21T22:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta',          country: 'Estados Unidos' },
      { iso: '2026-06-27T22:00:00Z', venue: 'Gillette Stadium',         city: 'Boston',           country: 'Estados Unidos' },
      { iso: '2026-06-27T22:00:00Z', venue: 'Lincoln Financial Field',  city: 'Filadélfia',       country: 'Estados Unidos' },
    ],
    H: [
      { iso: '2026-06-15T01:00:00Z', venue: 'NRG Stadium',              city: 'Houston',          country: 'Estados Unidos' },
      { iso: '2026-06-15T00:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami',            country: 'Estados Unidos' },
      { iso: '2026-06-22T01:00:00Z', venue: 'AT&T Stadium',             city: 'Dallas',           country: 'Estados Unidos' },
      { iso: '2026-06-22T00:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta',          country: 'Estados Unidos' },
      { iso: '2026-06-28T22:00:00Z', venue: 'NRG Stadium',              city: 'Houston',          country: 'Estados Unidos' },
      { iso: '2026-06-28T22:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami',            country: 'Estados Unidos' },
    ],
    I: [
      { iso: '2026-06-15T19:00:00Z', venue: 'Gillette Stadium',         city: 'Boston',           country: 'Estados Unidos' },
      { iso: '2026-06-15T22:00:00Z', venue: 'Lincoln Financial Field',  city: 'Filadélfia',       country: 'Estados Unidos' },
      { iso: '2026-06-22T19:00:00Z', venue: 'MetLife Stadium',          city: 'Nova York/NJ',     country: 'Estados Unidos' },
      { iso: '2026-06-22T22:00:00Z', venue: 'Gillette Stadium',         city: 'Boston',           country: 'Estados Unidos' },
      { iso: '2026-06-28T02:00:00Z', venue: 'MetLife Stadium',          city: 'Nova York/NJ',     country: 'Estados Unidos' },
      { iso: '2026-06-28T02:00:00Z', venue: 'Lincoln Financial Field',  city: 'Filadélfia',       country: 'Estados Unidos' },
    ],
    J: [
      { iso: '2026-06-16T02:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City',      country: 'Estados Unidos' },
      { iso: '2026-06-16T00:00:00Z', venue: 'Rose Bowl',                city: 'Los Angeles',      country: 'Estados Unidos' },
      { iso: '2026-06-23T02:00:00Z', venue: 'AT&T Stadium',             city: 'Dallas',           country: 'Estados Unidos' },
      { iso: '2026-06-23T00:00:00Z', venue: 'NRG Stadium',              city: 'Houston',          country: 'Estados Unidos' },
      { iso: '2026-06-28T19:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City',      country: 'Estados Unidos' },
      { iso: '2026-06-28T19:00:00Z', venue: 'Rose Bowl',                city: 'Los Angeles',      country: 'Estados Unidos' },
    ],
    K: [
      { iso: '2026-06-16T19:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami',            country: 'Estados Unidos' },
      { iso: '2026-06-16T22:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta',          country: 'Estados Unidos' },
      { iso: '2026-06-23T19:00:00Z', venue: 'Lincoln Financial Field',  city: 'Filadélfia',       country: 'Estados Unidos' },
      { iso: '2026-06-23T22:00:00Z', venue: 'Gillette Stadium',         city: 'Boston',           country: 'Estados Unidos' },
      { iso: '2026-06-29T22:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami',            country: 'Estados Unidos' },
      { iso: '2026-06-29T22:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta',          country: 'Estados Unidos' },
    ],
    L: [
      { iso: '2026-06-17T02:00:00Z', venue: 'Gillette Stadium',         city: 'Boston',           country: 'Estados Unidos' },
      { iso: '2026-06-17T00:00:00Z', venue: 'MetLife Stadium',          city: 'Nova York/NJ',     country: 'Estados Unidos' },
      { iso: '2026-06-24T02:00:00Z', venue: 'MetLife Stadium',          city: 'Nova York/NJ',     country: 'Estados Unidos' },
      { iso: '2026-06-24T00:00:00Z', venue: 'Gillette Stadium',         city: 'Boston',           country: 'Estados Unidos' },
      { iso: '2026-06-29T19:00:00Z', venue: 'MetLife Stadium',          city: 'Nova York/NJ',     country: 'Estados Unidos' },
      { iso: '2026-06-29T19:00:00Z', venue: 'Gillette Stadium',         city: 'Boston',           country: 'Estados Unidos' },
    ],
  };

  let matchCounter = 1;
  const matchData = byGroup.flatMap(({ group, teamIds }, _groupIndex) => {
    const fixtures = groupFixtures(teamIds);
    const slots = groupSlots[group.code] ?? [];
    return fixtures.map(([homeTeamId, awayTeamId], fixtureIndex) => {
      const num = matchCounter++;
      const slot = slots[fixtureIndex];
      const datetimeUtc = slot ? new Date(slot.iso) : new Date(`2026-06-11T16:00:00Z`);
      return {
        id: `match_${String(num).padStart(3, '0')}`,
        externalId: null,
        competitionId,
        stageId: 'stage_group',
        groupId: group.id,
        roundLabel: `Grupo ${group.code} - Rodada ${Math.floor(fixtureIndex / 2) + 1}`,
        matchNumber: num,
        venue: slot?.venue ?? 'TBD',
        city: slot?.city ?? 'TBD',
        country: slot?.country ?? 'Estados Unidos',
        date: new Date(datetimeUtc.toISOString().slice(0, 10)),
        time: datetimeUtc.toISOString().slice(11, 16),
        datetimeUtc,
        timezone: 'UTC',
        status: MatchStatus.SCHEDULED,
        isLive: false,
        minute: null,
        homeTeamId,
        awayTeamId,
        homeScore: 0,
        awayScore: 0,
        homePenaltyScore: null,
        awayPenaltyScore: null,
        winnerTeamId: null,
        source: 'seed',
        sourceLastSync: null,
        isOfficial: true,
      };
    });
  });

  await prisma.match.createMany({ data: matchData });

  const standingsData = byGroup.flatMap(({ group, teamIds }) =>
    teamIds.map((teamId, idx) => ({
      id: `standing_${group.code}_${idx + 1}`,
      competitionId,
      stageId: 'stage_group',
      groupId: group.id,
      teamId,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      position: idx + 1,
      qualificationStatus: QualificationStatus.TBD,
    })),
  );

  await prisma.standing.createMany({ data: standingsData });

  const knockoutSlots: Array<{
    id: string;
    competitionId: string;
    stageId: string;
    slotCode: string;
    label: string;
    sourceRule: string;
    nextSlotCode: string | null;
  }> = [];

  for (let i = 1; i <= 16; i++) {
    knockoutSlots.push({
      id: `slot_r32_${i}`,
      competitionId,
      stageId: 'stage_r32',
      slotCode: `R32_${i}`,
      label: `Round of 32 - Match ${i}`,
      sourceRule: i <= 12 ? `Group runner-up and winner routing ${i}` : `Best third routing ${i}`,
      nextSlotCode: `R16_${Math.ceil(i / 2)}`,
    });
  }

  for (let i = 1; i <= 8; i++) {
    knockoutSlots.push({
      id: `slot_r16_${i}`,
      competitionId,
      stageId: 'stage_r16',
      slotCode: `R16_${i}`,
      label: `Round of 16 - Match ${i}`,
      sourceRule: `Winner R32_${2 * i - 1} vs Winner R32_${2 * i}`,
      nextSlotCode: `QF_${Math.ceil(i / 2)}`,
    });
  }

  for (let i = 1; i <= 4; i++) {
    knockoutSlots.push({
      id: `slot_qf_${i}`,
      competitionId,
      stageId: 'stage_qf',
      slotCode: `QF_${i}`,
      label: `Quarter-final ${i}`,
      sourceRule: `Winner R16_${2 * i - 1} vs Winner R16_${2 * i}`,
      nextSlotCode: `SF_${Math.ceil(i / 2)}`,
    });
  }

  for (let i = 1; i <= 2; i++) {
    knockoutSlots.push({
      id: `slot_sf_${i}`,
      competitionId,
      stageId: 'stage_sf',
      slotCode: `SF_${i}`,
      label: `Semi-final ${i}`,
      sourceRule: `Winner QF_${2 * i - 1} vs Winner QF_${2 * i}`,
      nextSlotCode: 'FINAL_1',
    });
  }

  knockoutSlots.push({
    id: 'slot_third_1',
    competitionId,
    stageId: 'stage_third',
    slotCode: 'THIRD_1',
    label: 'Third Place Match',
    sourceRule: 'Loser SF_1 vs Loser SF_2',
    nextSlotCode: null,
  });

  knockoutSlots.push({
    id: 'slot_final_1',
    competitionId,
    stageId: 'stage_final',
    slotCode: 'FINAL_1',
    label: 'Final',
    sourceRule: 'Winner SF_1 vs Winner SF_2',
    nextSlotCode: null,
  });

  await prisma.knockoutSlot.createMany({ data: knockoutSlots });

  // ── PredictionModel ──────────────────────────────────────────────────────────
  await prisma.predictionModel.upsert({
    where: { name_version: { name: 'poisson-v1', version: '1.0.0' } },
    create: {
      name: 'poisson-v1',
      version: '1.0.0',
      description: 'Poisson model with attack/defense strength from in-tournament stats',
      isActive: true,
    },
    update: { isActive: true },
  });

  // ── Bookmakers ───────────────────────────────────────────────────────────────
  const bookmakers = [
    { slug: 'bet365',   name: 'Bet365',   isSharp: false },
    { slug: 'pinnacle', name: 'Pinnacle', isSharp: true  },
    { slug: 'unibet',   name: 'Unibet',   isSharp: false },
  ];
  for (const bk of bookmakers) {
    await prisma.bookmaker.upsert({
      where: { slug: bk.slug },
      create: { ...bk, isActive: true },
      update: { name: bk.name, isSharp: bk.isSharp },
    });
  }

  // ── Markets ──────────────────────────────────────────────────────────────────
  const markets = [
    { code: '1X2',   name: '1X2 — Resultado Final',    category: 'match' },
    { code: 'DC',    name: 'Dupla Chance',              category: 'match' },
    { code: 'DNB',   name: 'Empate Anula Aposta',       category: 'match' },
    { code: 'OU_25', name: 'Mais/Menos de 2.5 Gols',   category: 'goals' },
    { code: 'BTTS',  name: 'Ambas Marcam',              category: 'goals' },
    { code: 'TO_QUALIFY', name: 'Passa de Fase',        category: 'tournament' },
  ];
  for (const mkt of markets) {
    await prisma.market.upsert({
      where: { code: mkt.code },
      create: mkt,
      update: { name: mkt.name, category: mkt.category },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
