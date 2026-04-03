import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-response';
import { assertCronAuthorized } from '@/lib/cron-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    assertCronAuthorized(request);
    return ok({ synced: true, message: 'Groups are static in initial version' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    const status = message.toLowerCase().includes('unauthorized') ? 401 : 500;
    return fail(message, status);
  }
}
