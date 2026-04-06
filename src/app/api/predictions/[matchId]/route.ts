import { NextRequest } from 'next/server';
import { ok, notFound, serverError } from '@/lib/api-response';
import { getMatchPrediction } from '@/modules/predictions/service';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const { matchId } = await params;
    const prediction = await getMatchPrediction(matchId);
    if (!prediction) return notFound('No prediction found for this match');
    return ok(prediction);
  } catch (e) {
    return serverError(e);
  }
}
