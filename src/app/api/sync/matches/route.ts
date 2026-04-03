import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-response';
import { assertCronAuthorized } from '@/lib/cron-auth';
import { cacheTagsToInvalidateAfterSync } from '@/lib/cache-keys';
import { invalidateCacheByPrefixes, syncMatches, syncStandings, syncKnockout, syncCurrentStage } from '@/modules/sync/service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    assertCronAuthorized(request);
    const matches = await syncMatches();
    await syncStandings();
    await syncKnockout();
    await syncCurrentStage();
    await invalidateCacheByPrefixes(cacheTagsToInvalidateAfterSync);
    return ok({ synced: true, result: matches });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    const status = message.toLowerCase().includes('unauthorized') ? 401 : 500;
    return fail(message, status);
  }
}
