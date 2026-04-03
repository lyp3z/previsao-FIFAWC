import { withErrorHandling } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { getBracket } from '@/modules/knockout/service';

export const runtime = 'nodejs';

export async function GET() {
  return withErrorHandling(async () => getBracket(DEFAULT_COMPETITION_ID));
}
