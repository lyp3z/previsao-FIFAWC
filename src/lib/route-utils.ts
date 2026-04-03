import { NextRequest } from 'next/server';

export function getSearchParamsObject(request: NextRequest) {
  return Object.fromEntries(request.nextUrl.searchParams.entries());
}
