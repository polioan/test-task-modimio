import { injectable } from 'inversify'
import { config } from 'dotenv-safe'
import type { IEnv, Input, Output } from './env.interface.js'
import { schema } from './env.schema.js'

@injectable()
export class EnvService implements IEnv {
  private readonly values: Map<string, unknown>

  public readonly isDevelopment: boolean
  public readonly isProduction: boolean

  constructor() {
    const { error, parsed } = config({})

    if (error) {
      throw new Error('Error reading .env file.', { cause: error })
    }
    if (!parsed) {
      throw new Error('Empty or broken .env file.')
    }

    this.values = new Map(
      Object.entries(schema.parse({ ...process.env, ...parsed }))
    )

    const NODE_ENV = this.get('NODE_ENV')

    this.isDevelopment = NODE_ENV === 'development'
    this.isProduction = NODE_ENV === 'production'
  }

  public get<T extends Input>(key: T): Output<T> {
    // @ts-expect-error
    return this.values.get(key)
  }
}
