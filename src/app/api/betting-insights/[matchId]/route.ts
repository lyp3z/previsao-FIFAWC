import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/api-response';
import { getMatchInsights } from '@/modules/betting/service';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const { matchId } = await params;
    const insights = await getMatchInsights(matchId);
    return ok(insights);
  } catch (e) {
    return serverError(e);
  }
}
