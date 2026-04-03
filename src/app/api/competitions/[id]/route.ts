import { fail, ok } from '@/lib/api-response';
import { getCompetitionById } from '@/modules/competitions/service';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const competition = await getCompetitionById(id);
    if (!competition) return fail('Competition not found', 404);
    return ok(competition);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Unexpected error', 500);
  }
}
