export const cacheKeys = {
  matches: (suffix: string) => `matches:${suffix}`,
  matchById: (id: string) => `match:${id}`,
  standingsAll: (competitionId: string) => `standings:${competitionId}:all`,
  standingsGroup: (competitionId: string, groupCode: string) => `standings:${competitionId}:group:${groupCode}`,
  knockout: (competitionId: string) => `knockout:${competitionId}`,
  bracket: (competitionId: string) => `knockout:${competitionId}:bracket`,
  currentStage: (competitionId: string) => `competition:${competitionId}:current-stage`,
  simulator: (hash: string) => `simulator:${hash}`,
};

export const cacheTagsToInvalidateAfterSync = [
  'matches:',
  'standings:',
  'knockout:',
  'competition:',
  'simulator:',
];
