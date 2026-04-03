import { z } from 'zod';

export const matchFiltersSchema = z.object({
  date: z.string().optional(),
  stage: z.string().optional(),
  group: z.string().optional(),
  status: z.string().optional(),
  team: z.string().optional(),
  liveOnly: z.enum(['true', 'false']).optional(),
});

export function parseQuery<T extends z.ZodTypeAny>(schema: T, payload: unknown): z.infer<T> {
  return schema.parse(payload);
}
