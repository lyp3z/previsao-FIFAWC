import { NextRequest } from 'next/server';
import { ok, notFound, serverError } from '@/lib/api-response';
import { getTeamProjection } from '@/modules/predictions/service';
import { COMPETITION_ID } from '@/lib/constants';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projection = await getTeamProjection(id, COMPETITION_ID);
    if (!projection) return notFound('No projection found for this team');
    return ok(projection);
  } catch (e) {
    return serverError(e);
  }
}
