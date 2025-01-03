import { z } from 'zod'

export const tokensSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .passthrough()

export type Tokens = z.infer<typeof tokensSchema>
