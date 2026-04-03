import { withErrorHandling } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { listTodayMatches } from '@/modules/matches/service';

export const runtime = 'nodejs';

export async function GET() {
  return withErrorHandling(async () => listTodayMatches(DEFAULT_COMPETITION_ID));
}
