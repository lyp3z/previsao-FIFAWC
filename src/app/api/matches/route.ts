import { NextRequest } from 'next/server';
import { withErrorHandling } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { getSearchParamsObject } from '@/lib/route-utils';
import { listMatches } from '@/modules/matches/service';
import { parseQuery, matchFiltersSchema } from '@/shared/validators/common';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const params = parseQuery(matchFiltersSchema, getSearchParamsObject(request));
    return listMatches(params, DEFAULT_COMPETITION_ID);
  });
}
