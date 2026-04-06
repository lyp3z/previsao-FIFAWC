import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { assertCronAuthorized } from '@/lib/cron-auth';
import { computeMatchPredictions } from '@/modules/predictions/service';
import { COMPETITION_ID } from '@/lib/constants';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    assertCronAuthorized(request);
    const result = await computeMatchPredictions(COMPETITION_ID);
    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    const status = message.toLowerCase().includes('unauthorized') ? 401 : 500;
    return fail(message, status);
  }
}
