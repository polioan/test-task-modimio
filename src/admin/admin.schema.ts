import { z } from 'zod'

export const loginSchema = z.object({
  password: z.string(),
  email: z.string().email().max(320),
})

export type Login = z.infer<typeof loginSchema>

export const getUsersSchema = z.object({
  sortBy: z.enum(['email', 'login']),
  page: z.coerce.number().finite().int().min(1),
})

export type GetUsers = z.infer<typeof getUsersSchema>

export const usersSchema = z
  .object({
    users: z
      .object({
        email: z.string().email().max(320),
        login: z.string().max(255),
        id: z.number(),
        emailVerifiedAt: z.date().nullable().optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })
      .array(),
  })
  .passthrough()

export type Users = z.infer<typeof usersSchema>
