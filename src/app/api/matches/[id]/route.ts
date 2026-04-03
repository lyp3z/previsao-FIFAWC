import { fail, ok } from '@/lib/api-response';
import { getMatchById } from '@/modules/matches/service';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const match = await getMatchById(id);
    if (!match) return fail('Match not found', 404);
    return ok(match);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Unexpected error', 500);
  }
}
