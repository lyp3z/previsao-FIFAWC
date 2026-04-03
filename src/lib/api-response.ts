import { NextResponse } from 'next/server';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        details,
      },
    },
    { status },
  );
}

export async function withErrorHandling<T>(fn: () => Promise<T>) {
  try {
    const data = await fn();
    return ok(data);
  } catch (error) {
    if (error instanceof Error) {
      return fail(error.message, 500);
    }
    return fail('Unexpected server error', 500);
  }
}
