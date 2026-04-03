import { env } from '@/lib/env';
import { MockSportsProvider } from '@/providers/sports/mock-provider';
import { RealSportsProvider } from '@/providers/sports/real-provider';
import type { SportsDataProvider } from '@/providers/sports/types';

export function getSportsProvider(): SportsDataProvider {
  if (env.SPORTS_PROVIDER === 'real') {
    return new RealSportsProvider();
  }

  return new MockSportsProvider();
}
