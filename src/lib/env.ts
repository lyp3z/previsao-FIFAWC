import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().default(''),
  DIRECT_DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SPORTS_API_KEY: z.string().optional(),
  SPORTS_API_BASE_URL: z.string().optional(),
  CRON_SECRET: z.string().default(''),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  SPORTS_PROVIDER: z.enum(['mock', 'real']).default('mock'),
});

export const env = envSchema.parse(process.env);

export function assertRequiredEnv(name: 'DATABASE_URL' | 'CRON_SECRET') {
  if (!env[name]) {
    throw new Error(`${name} is required`);
  }
}
