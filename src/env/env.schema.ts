import { z } from 'zod'

export const schema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  SERVER_PORT: z.coerce.number().finite().int(),
  SERVER_HOST: z.string(),
  SERVER_CORS_ORIGINS: z.string().transform(v => {
    return v.split(',').filter(Boolean)
  }),
  CACHE_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  OPENAPI: z.enum(['on', 'off']),
  JWT_SECRET: z.string(),
})
