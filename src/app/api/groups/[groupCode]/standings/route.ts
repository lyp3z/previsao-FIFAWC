import { withErrorHandling } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { getStandingsByGroupCode } from '@/modules/standings/service';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ groupCode: string }> }) {
  const { groupCode } = await params;
  return withErrorHandling(async () => getStandingsByGroupCode(groupCode, DEFAULT_COMPETITION_ID));
}
