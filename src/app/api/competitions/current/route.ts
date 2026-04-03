import { fail, ok } from '@/lib/api-response';
import { getCurrentCompetition } from '@/modules/competitions/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const competition = await getCurrentCompetition();
    if (!competition) return fail('Current competition not found', 404);
    return ok(competition);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Unexpected error', 500);
  }
}
