import { NextRequest } from 'next/server';
import { env } from '@/lib/env';

export function assertCronAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const xCronSecret = request.headers.get('x-cron-secret');

  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;
  const providedToken = bearerToken ?? xCronSecret;

  if (!providedToken || providedToken !== env.CRON_SECRET) {
    throw new Error('Unauthorized cron request');
  }
}
