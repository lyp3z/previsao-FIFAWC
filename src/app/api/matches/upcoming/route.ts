import { withErrorHandling } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { listUpcomingMatches } from '@/modules/matches/service';

export const runtime = 'nodejs';

export async function GET() {
  return withErrorHandling(async () => listUpcomingMatches(DEFAULT_COMPETITION_ID));
}
