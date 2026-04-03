import { fail, ok } from '@/lib/api-response';
import { DEFAULT_COMPETITION_ID } from '@/lib/constants';
import { getGroupByCode } from '@/modules/groups/service';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ groupCode: string }> }) {
  try {
    const { groupCode } = await params;
    const group = await getGroupByCode(groupCode, DEFAULT_COMPETITION_ID);
    if (!group) return fail('Group not found', 404);
    return ok(group);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Unexpected error', 500);
  }
}
