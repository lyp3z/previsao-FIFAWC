import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/api-response';
import { computeMatchPredictions } from '@/modules/predictions/service';
import { COMPETITION_ID } from '@/lib/constants';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  try {
    const result = await computeMatchPredictions(COMPETITION_ID);
    return ok(result);
  } catch (e) {
    return serverError(e);
  }
}
