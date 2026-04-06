import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/api-response';
import { getMatchOdds } from '@/modules/odds/service';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const { matchId } = await params;
    const odds = await getMatchOdds(matchId);
    return ok(odds);
  } catch (e) {
    return serverError(e);
  }
}
