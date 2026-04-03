import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { simulateKnockout } from '@/modules/simulator/service';
import { simulatorPayloadSchema } from '@/shared/validators/simulator';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = simulatorPayloadSchema.parse(await request.json());
    const data = await simulateKnockout(body.overrides, DEFAULT_COMPETITION_ID);
    return ok(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Invalid request', 400);
  }
}
