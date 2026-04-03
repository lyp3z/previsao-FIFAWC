import { fail, ok } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { getCurrentStage } from '@/modules/competitions/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const currentStage = await getCurrentStage(DEFAULT_COMPETITION_ID);
    if (!currentStage) return fail('Current stage not found', 404);
    return ok(currentStage);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Unexpected error', 500);
  }
}
