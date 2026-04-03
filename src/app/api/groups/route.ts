import { withErrorHandling } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { listGroups } from '@/modules/groups/service';

export const runtime = 'nodejs';

export async function GET() {
  return withErrorHandling(async () => listGroups(DEFAULT_COMPETITION_ID));
}
