import { withErrorHandling } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { listTeams } from '@/modules/teams/service';

export const runtime = 'nodejs';

export async function GET() {
  return withErrorHandling(async () => listTeams(DEFAULT_COMPETITION_ID));
}
