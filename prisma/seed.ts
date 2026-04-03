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
  { id: 'team_mex', name: 'Mexico', shortName: 'Mexico', code: 'MEX', emoji: '🇲🇽', confederation: 'CONCACAF', groupCode: 'A' },
  { id: 'team_usa', name: 'United States', shortName: 'USA', code: 'USA', emoji: '🇺🇸', confederation: 'CONCACAF', groupCode: 'A' },
  { id: 'team_can', name: 'Canada', shortName: 'Canada', code: 'CAN', emoji: '🇨🇦', confederation: 'CONCACAF', groupCode: 'A' },
  { id: 'team_crc', name: 'Costa Rica', shortName: 'Costa Rica', code: 'CRC', emoji: '🇨🇷', confederation: 'CONCACAF', groupCode: 'A' },

  { id: 'team_bra', name: 'Brazil', shortName: 'Brazil', code: 'BRA', emoji: '🇧🇷', confederation: 'CONMEBOL', groupCode: 'B' },
  { id: 'team_arg', name: 'Argentina', shortName: 'Argentina', code: 'ARG', emoji: '🇦🇷', confederation: 'CONMEBOL', groupCode: 'B' },
  { id: 'team_uru', name: 'Uruguay', shortName: 'Uruguay', code: 'URU', emoji: '🇺🇾', confederation: 'CONMEBOL', groupCode: 'B' },
  { id: 'team_col', name: 'Colombia', shortName: 'Colombia', code: 'COL', emoji: '🇨🇴', confederation: 'CONMEBOL', groupCode: 'B' },

  { id: 'team_fra', name: 'France', shortName: 'France', code: 'FRA', emoji: '🇫🇷', confederation: 'UEFA', groupCode: 'C' },
  { id: 'team_eng', name: 'England', shortName: 'England', code: 'ENG', emoji: '🏴', confederation: 'UEFA', groupCode: 'C' },
  { id: 'team_esp', name: 'Spain', shortName: 'Spain', code: 'ESP', emoji: '🇪🇸', confederation: 'UEFA', groupCode: 'C' },
  { id: 'team_ger', name: 'Germany', shortName: 'Germany', code: 'GER', emoji: '🇩🇪', confederation: 'UEFA', groupCode: 'C' },

  { id: 'team_por', name: 'Portugal', shortName: 'Portugal', code: 'POR', emoji: '🇵🇹', confederation: 'UEFA', groupCode: 'D' },
  { id: 'team_ita', name: 'Italy', shortName: 'Italy', code: 'ITA', emoji: '🇮🇹', confederation: 'UEFA', groupCode: 'D' },
  { id: 'team_ned', name: 'Netherlands', shortName: 'Netherlands', code: 'NED', emoji: '🇳🇱', confederation: 'UEFA', groupCode: 'D' },
  { id: 'team_cro', name: 'Croatia', shortName: 'Croatia', code: 'CRO', emoji: '🇭🇷', confederation: 'UEFA', groupCode: 'D' },

  { id: 'team_bel', name: 'Belgium', shortName: 'Belgium', code: 'BEL', emoji: '🇧🇪', confederation: 'UEFA', groupCode: 'E' },
  { id: 'team_sui', name: 'Switzerland', shortName: 'Switzerland', code: 'SUI', emoji: '🇨🇭', confederation: 'UEFA', groupCode: 'E' },
  { id: 'team_den', name: 'Denmark', shortName: 'Denmark', code: 'DEN', emoji: '🇩🇰', confederation: 'UEFA', groupCode: 'E' },
  { id: 'team_swe', name: 'Sweden', shortName: 'Sweden', code: 'SWE', emoji: '🇸🇪', confederation: 'UEFA', groupCode: 'E' },

  { id: 'team_mar', name: 'Morocco', shortName: 'Morocco', code: 'MAR', emoji: '🇲🇦', confederation: 'CAF', groupCode: 'F' },
  { id: 'team_sen', name: 'Senegal', shortName: 'Senegal', code: 'SEN', emoji: '🇸🇳', confederation: 'CAF', groupCode: 'F' },
  { id: 'team_nga', name: 'Nigeria', shortName: 'Nigeria', code: 'NGA', emoji: '🇳🇬', confederation: 'CAF', groupCode: 'F' },
  { id: 'team_cmr', name: 'Cameroon', shortName: 'Cameroon', code: 'CMR', emoji: '🇨🇲', confederation: 'CAF', groupCode: 'F' },

  { id: 'team_jpn', name: 'Japan', shortName: 'Japan', code: 'JPN', emoji: '🇯🇵', confederation: 'AFC', groupCode: 'G' },
  { id: 'team_kor', name: 'South Korea', shortName: 'Korea Rep.', code: 'KOR', emoji: '🇰🇷', confederation: 'AFC', groupCode: 'G' },
  { id: 'team_aus', name: 'Australia', shortName: 'Australia', code: 'AUS', emoji: '🇦🇺', confederation: 'AFC', groupCode: 'G' },
  { id: 'team_irn', name: 'Iran', shortName: 'Iran', code: 'IRN', emoji: '🇮🇷', confederation: 'AFC', groupCode: 'G' },

  { id: 'team_ksa', name: 'Saudi Arabia', shortName: 'Saudi Arabia', code: 'KSA', emoji: '🇸🇦', confederation: 'AFC', groupCode: 'H' },
  { id: 'team_qat', name: 'Qatar', shortName: 'Qatar', code: 'QAT', emoji: '🇶🇦', confederation: 'AFC', groupCode: 'H' },
  { id: 'team_uae', name: 'United Arab Emirates', shortName: 'UAE', code: 'UAE', emoji: '🇦🇪', confederation: 'AFC', groupCode: 'H' },
  { id: 'team_irq', name: 'Iraq', shortName: 'Iraq', code: 'IRQ', emoji: '🇮🇶', confederation: 'AFC', groupCode: 'H' },

  { id: 'team_pol', name: 'Poland', shortName: 'Poland', code: 'POL', emoji: '🇵🇱', confederation: 'UEFA', groupCode: 'I' },
  { id: 'team_cze', name: 'Czechia', shortName: 'Czechia', code: 'CZE', emoji: '🇨🇿', confederation: 'UEFA', groupCode: 'I' },
  { id: 'team_aut', name: 'Austria', shortName: 'Austria', code: 'AUT', emoji: '🇦🇹', confederation: 'UEFA', groupCode: 'I' },
  { id: 'team_srb', name: 'Serbia', shortName: 'Serbia', code: 'SRB', emoji: '🇷🇸', confederation: 'UEFA', groupCode: 'I' },

  { id: 'team_per', name: 'Peru', shortName: 'Peru', code: 'PER', emoji: '🇵🇪', confederation: 'CONMEBOL', groupCode: 'J' },
  { id: 'team_chi', name: 'Chile', shortName: 'Chile', code: 'CHI', emoji: '🇨🇱', confederation: 'CONMEBOL', groupCode: 'J' },
  { id: 'team_par', name: 'Paraguay', shortName: 'Paraguay', code: 'PAR', emoji: '🇵🇾', confederation: 'CONMEBOL', groupCode: 'J' },
  { id: 'team_ecu', name: 'Ecuador', shortName: 'Ecuador', code: 'ECU', emoji: '🇪🇨', confederation: 'CONMEBOL', groupCode: 'J' },

  { id: 'team_egy', name: 'Egypt', shortName: 'Egypt', code: 'EGY', emoji: '🇪🇬', confederation: 'CAF', groupCode: 'K' },
  { id: 'team_tun', name: 'Tunisia', shortName: 'Tunisia', code: 'TUN', emoji: '🇹🇳', confederation: 'CAF', groupCode: 'K' },
  { id: 'team_alg', name: 'Algeria', shortName: 'Algeria', code: 'ALG', emoji: '🇩🇿', confederation: 'CAF', groupCode: 'K' },
  { id: 'team_civ', name: "Cote d'Ivoire", shortName: 'Cote d\'Ivoire', code: 'CIV', emoji: '🇨🇮', confederation: 'CAF', groupCode: 'K' },

  { id: 'team_nzl', name: 'New Zealand', shortName: 'New Zealand', code: 'NZL', emoji: '🇳🇿', confederation: 'OFC', groupCode: 'L' },
  { id: 'team_gre', name: 'Greece', shortName: 'Greece', code: 'GRE', emoji: '🇬🇷', confederation: 'UEFA', groupCode: 'L' },
  { id: 'team_rom', name: 'Romania', shortName: 'Romania', code: 'ROM', emoji: '🇷🇴', confederation: 'UEFA', groupCode: 'L' },
  { id: 'team_hun', name: 'Hungary', shortName: 'Hungary', code: 'HUN', emoji: '🇭🇺', confederation: 'UEFA', groupCode: 'L' },
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
      currentStageId: 'stage_group',
    },
  });

  await prisma.stage.createMany({
    data: stages.map((stage) => ({ ...stage, competitionId })),
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

  const baseDate = new Date('2026-06-11T16:00:00.000Z');
  let matchCounter = 1;
  const matchData = byGroup.flatMap(({ group, teamIds }, groupIndex) => {
    const fixtures = groupFixtures(teamIds);
    return fixtures.map(([homeTeamId, awayTeamId], fixtureIndex) => {
      const num = matchCounter++;
      const datetimeUtc = new Date(baseDate.getTime() + (groupIndex * 6 + fixtureIndex) * 4 * 60 * 60 * 1000);
      return {
        id: `match_${String(num).padStart(3, '0')}`,
        externalId: null,
        competitionId,
        stageId: 'stage_group',
        groupId: group.id,
        roundLabel: `Group ${group.code} - Matchday ${Math.floor(fixtureIndex / 2) + 1}`,
        matchNumber: num,
        venue: `Stadium ${group.code}${fixtureIndex + 1}`,
        city: 'TBD',
        country: 'United States',
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
