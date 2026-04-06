import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/api-response';
import { getTopValueBets } from '@/modules/betting/service';
import { COMPETITION_ID } from '@/lib/constants';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get('limit') ?? '20');
    const bets = await getTopValueBets(COMPETITION_ID, isNaN(limit) ? 20 : limit);
    return ok(bets);
  } catch (e) {
    return serverError(e);
  }
}
