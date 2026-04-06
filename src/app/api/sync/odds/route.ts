import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { assertCronAuthorized } from '@/lib/cron-auth';
import { syncOdds, buildOddsSnapshots } from '@/modules/odds/service';
import { COMPETITION_ID } from '@/lib/constants';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    assertCronAuthorized(request);
    const syncResult  = await syncOdds(COMPETITION_ID);
    const snapResult  = await buildOddsSnapshots(COMPETITION_ID);
    return ok({ ...syncResult, ...snapResult });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    const status = message.toLowerCase().includes('unauthorized') ? 401 : 500;
    return fail(message, status);
  }
}
