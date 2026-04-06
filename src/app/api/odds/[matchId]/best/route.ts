import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/api-response';
import { getBestOdds } from '@/modules/odds/service';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const { matchId } = await params;
    const best = await getBestOdds(matchId);
    return ok(best);
  } catch (e) {
    return serverError(e);
  }
}
