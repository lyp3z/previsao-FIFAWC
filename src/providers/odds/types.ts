export interface OddsSelection {
  selectionCode:  string; // e.g. "HOME", "DRAW", "AWAY", "OVER_25", "BTTS_YES"
  selectionLabel: string; // e.g. "Brasil", "Draw", "Argentina"
  odd:            number; // European decimal odd, e.g. 2.50
  line?:          number; // for Asian handicap / OU markets
}

export interface RawMatchOdds {
  matchId:    string;
  marketCode: string; // "1X2" | "DNB" | "DC" | "OU_25" | "BTTS" | "TO_QUALIFY"
  bookmaker:  string; // slug
  selections: OddsSelection[];
  capturedAt: Date;
}

export interface OddsProvider {
  name: string;
  fetchOdds(matchIds: string[]): Promise<RawMatchOdds[]>;
}
