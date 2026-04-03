import { withErrorHandling } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { getTeamTournamentPath } from '@/modules/teams/service';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withErrorHandling(async () => getTeamTournamentPath(id, DEFAULT_COMPETITION_ID));
}
