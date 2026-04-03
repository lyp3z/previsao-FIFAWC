import { fail, ok } from '@/lib/api-response';
import { getTeamById } from '@/modules/teams/service';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const team = await getTeamById(id);
    if (!team) return fail('Team not found', 404);
    return ok(team);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Unexpected error', 500);
  }
}
