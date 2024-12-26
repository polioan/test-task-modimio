import type { z } from 'zod'
import type { schema } from './env.schema.js'

export type Parsed = z.infer<typeof schema>

export type ParsedKeys = keyof Parsed

export type Input = ParsedKeys | (string & {})

export type Output<T extends Input> = T extends ParsedKeys
  ? Parsed[T]
  : string | undefined

export interface IEnv {
  get: <T extends Input>(key: T) => Output<T>
  isDevelopment: boolean
  isProduction: boolean
}
