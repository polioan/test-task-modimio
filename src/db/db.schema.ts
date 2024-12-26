import {
  pgTable,
  bigserial,
  bigint,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import type { InferSelectModel } from 'drizzle-orm'

const ids = {
  id: bigserial('id', {
    mode: 'number',
  }).primaryKey(),
} as const

export interface Ids {
  id: string
}

const timestamps = {
  createdAt: timestamp('created_at', {
    mode: 'date',
    precision: 3,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', {
    mode: 'date',
    precision: 3,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => {
      return new Date()
    }),
} as const

export interface Timestamps {
  createdAt: Date
  updatedAt: Date
}

export type Meta = Ids & Timestamps

export type WithoutMeta<T> = Omit<T, keyof Meta>

export const users = pgTable('users', {
  ...ids,

  login: varchar('login', {
    length: 255,
  })
    .notNull()
    .unique(),

  email: varchar('email', {
    length: 320,
  })
    .notNull()
    .unique(),

  password: varchar('password', {
    length: 255,
  }).notNull(),

  emailVerifiedAt: timestamp('email_verified_at', {
    mode: 'date',
    precision: 3,
  }),

  ...timestamps,
})

export type User = InferSelectModel<typeof users>

export const admins = pgTable('admins', {
  ...ids,

  email: varchar('email', {
    length: 320,
  })
    .notNull()
    .unique(),

  password: varchar('password', {
    length: 255,
  }).notNull(),

  ...timestamps,
})

export type Admin = InferSelectModel<typeof admins>

export const refreshTokens = pgTable('refresh_tokens', {
  ...ids,

  userId: bigint('user_id', {
    mode: 'number',
  }).notNull(),

  token: varchar('token', {
    length: 255,
  }).notNull(),

  expiresAt: timestamp('expires_at', {
    mode: 'date',
    precision: 3,
  }).notNull(),

  ...timestamps,
})

export type RefreshToken = InferSelectModel<typeof refreshTokens>
