import { defineConfig } from 'drizzle-kit'

const { DATABASE_URL } = process.env

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined.')
}

export default defineConfig({
  schema: './src/db/db.schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
})
