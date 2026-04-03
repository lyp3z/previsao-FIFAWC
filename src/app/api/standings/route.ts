import { withErrorHandling } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { getStandings } from '@/modules/standings/service';

export const runtime = 'nodejs';

export async function GET() {
  return withErrorHandling(async () => getStandings(DEFAULT_COMPETITION_ID));
}
