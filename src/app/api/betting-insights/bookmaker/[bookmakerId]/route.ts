import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/api-response';
import { getBookmakerInsights } from '@/modules/betting/service';
import { COMPETITION_ID } from '@/lib/constants';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ bookmakerId: string }> }) {
  try {
    const { bookmakerId } = await params;
    const insights = await getBookmakerInsights(bookmakerId, COMPETITION_ID);
    return ok(insights);
  } catch (e) {
    return serverError(e);
  }
}
