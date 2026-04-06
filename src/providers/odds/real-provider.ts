import type { OddsProvider, RawMatchOdds } from './types';

/**
 * Real odds provider — stub for The Odds API (the-odds-api.com).
 * Set ODDS_API_KEY + ODDS_API_BASE_URL in your env to enable.
 * Until configured, falls back to an empty response.
 */
export const RealOddsProvider: OddsProvider = {
  name: 'real',

  async fetchOdds(matchIds: string[]): Promise<RawMatchOdds[]> {
    const apiKey  = process.env.ODDS_API_KEY;
    const baseUrl = process.env.ODDS_API_BASE_URL;

    if (!apiKey || !baseUrl) {
      console.warn('[RealOddsProvider] ODDS_API_KEY or ODDS_API_BASE_URL not set — returning empty.');
      return [];
    }

    // TODO: implement mapping from internal matchIds → external event IDs,
    // fetch from the provider, then normalize to RawMatchOdds format.
    console.warn('[RealOddsProvider] Real fetching not yet implemented. Returning empty.');
    return [];
  },
};
