import { withErrorHandling } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { getTeamPath } from '@/modules/knockout/service';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  return withErrorHandling(async () => getTeamPath(teamId, DEFAULT_COMPETITION_ID));
}
