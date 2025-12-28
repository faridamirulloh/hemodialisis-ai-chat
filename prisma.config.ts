import * as dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load .env.development file
dotenv.config({ path: '.env.development' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
