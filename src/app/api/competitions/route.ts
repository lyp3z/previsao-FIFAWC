import { withErrorHandling } from '@/lib/api-response';
import { listCompetitions } from '@/modules/competitions/service';

export const runtime = 'nodejs';

export async function GET() {
  return withErrorHandling(async () => listCompetitions());
}
