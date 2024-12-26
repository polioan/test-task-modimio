import { z } from 'zod'

export const loginSchema = z
  .object({
    password: z.string(),
  })
  .and(
    z.union([
      z.object({
        login: z.string().max(255),
      }),
      z.object({
        email: z.string().email().max(320),
      }),
    ])
  )

export type Login = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    login: z.string().max(255),
    email: z.string().email().max(320),
    password: z.string().max(50),
    confirmPassword: z.string().max(50),
  })
  .refine(
    ({ password, confirmPassword }) => {
      return password === confirmPassword
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  )

export type Register = z.infer<typeof registerSchema>

export const meSchema = z
  .object({
    login: z.string().max(255),
    confirmed: z.boolean(),
  })
  .passthrough()

export type Me = z.infer<typeof meSchema>
