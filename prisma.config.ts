import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  seed: 'tsx prisma/seed.ts',
});
