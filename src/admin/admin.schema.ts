import { z } from 'zod'

export const loginSchema = z.object({
  password: z.string(),
  email: z.string().email().max(320),
})

export type Login = z.infer<typeof loginSchema>
