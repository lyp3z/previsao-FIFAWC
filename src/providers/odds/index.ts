import { MockOddsProvider } from './mock-provider';
import { RealOddsProvider } from './real-provider';
import type { OddsProvider } from './types';

export { MockOddsProvider, RealOddsProvider };
export type { OddsProvider, RawMatchOdds } from './types';

export function getOddsProvider(): OddsProvider {
  return process.env.ODDS_API_KEY ? RealOddsProvider : MockOddsProvider;
}
