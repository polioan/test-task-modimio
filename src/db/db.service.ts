import { injectable, inject } from 'inversify'
import { types } from '../di/dependency-types.js'
import type { IEnv } from '../env/env.interface.js'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './db.schema.js'
import { eq } from 'drizzle-orm'

@injectable()
export class DbService {
  public readonly client: pg.Client
  public readonly db: ReturnType<typeof drizzle<typeof schema, pg.Client>>

  constructor(@inject(types.Env) private readonly envService: IEnv) {
    this.client = new pg.Client({
      connectionString: this.envService.get('DATABASE_URL'),
    })

    this.db = drizzle(this.client, {
      logger: true,
      schema,
    })
  }

  public async launch() {
    await this.client.connect()
  }

  public async registerAdmin({
    email,
    password,
  }: {
    email: string
    password: string
  }) {
    const [admin] = await this.db
      .insert(schema.admins)
      .values({
        email,
        password,
      })
      .returning()

    return admin!
  }

  public async registerUser({
    email,
    login,
    password,
  }: {
    email: string
    login: string
    password: string
  }) {
    const [user] = await this.db
      .insert(schema.users)
      .values({
        email,
        login,
        password,
      })
      .returning()

    return user!
  }

  public async removeRefreshTokens(userId: number) {
    await this.db
      .delete(schema.refreshTokens)
      .where(eq(schema.refreshTokens.userId, userId))
  }

  public async createRefreshToken({
    expiresAt,
    token,
    userId,
  }: {
    expiresAt: Date
    userId: number
    token: string
  }) {
    const [refresh] = await this.db
      .insert(schema.refreshTokens)
      .values({
        expiresAt,
        userId,
        token,
      })
      .returning({ token: schema.refreshTokens.token })
    return refresh!.token
  }

  public async findRefreshToken(token: string) {
    const refresh = await this.db.query.refreshTokens.findFirst({
      where: eq(schema.refreshTokens.token, token),
    })
    return refresh
  }

  public async getAdminByEmail(email: string) {
    const admin = await this.db.query.admins.findFirst({
      where: eq(schema.admins.email, email),
    })
    return admin
  }

  public async getAdminById(id: number) {
    const admin = await this.db.query.admins.findFirst({
      where: eq(schema.admins.id, id),
    })
    return admin
  }

  public async getUserById(id: number) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    })
    return user
  }

  public async getUserByEmail(email: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    })
    return user
  }

  public async getUserByLogin(login: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.login, login),
    })
    return user
  }
}
