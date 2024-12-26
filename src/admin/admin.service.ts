import { injectable, inject } from 'inversify'
import type { Login, GetUsers } from './admin.schema.js'
import type * as schema from '../db/db.schema.js'
import { types } from '../di/dependency-types.js'
import type { IAuth } from '../auth/auth.interface.js'
import type { IDb } from '../db/db.interface.js'
import type { IHash } from '../hash/hash.interface.js'
import { ApiError } from '../api-error/api-error.class.js'
import { Unauthorized } from '../api-error/api-error.common.js'

@injectable()
export class AdminService {
  constructor(
    @inject(types.Auth) private readonly authService: IAuth,
    @inject(types.Db) private readonly dbService: IDb,
    @inject(types.Hash) private readonly hashService: IHash
  ) {}

  public async login({ email, password }: Login) {
    const admin = await this.dbService.getAdminByEmail(email)
    if (!admin) {
      throw Unauthorized
    }
    const isPasswordCorrect = await this.hashService.verify(
      admin.password,
      password
    )
    if (!isPasswordCorrect) {
      throw Unauthorized
    }
    const accessToken = await this.authService.generateAccessToken(admin.id)
    const refreshToken = await this.authService.generateRefreshToken(admin.id)
    return {
      accessToken,
      refreshToken,
    }
  }

  public async register({ email, password }: Login) {
    const admin = await this.dbService.getAdminByEmail(email)
    if (admin) {
      throw new ApiError({
        message: 'The email is occupied by another admin!',
        status: 'BAD_REQUEST',
      })
    }
    await this.dbService.registerAdmin({
      email,
      password: await this.hashService.hash(password),
    })
  }

  public async logout({ id }: schema.Admin) {
    await this.authService.removeRefreshTokens(id)
  }

  public async refresh(token: string) {
    const refresh = await this.dbService.findRefreshToken(token)
    if (!refresh || new Date() > refresh.expiresAt) {
      throw Unauthorized
    }
    const admin = await this.dbService.getAdminById(refresh.userId)
    if (!admin) {
      throw Unauthorized
    }
    await this.dbService.removeRefreshTokens(admin.id)
    const accessToken = await this.authService.generateAccessToken(admin.id)
    const refreshToken = await this.authService.generateRefreshToken(admin.id)
    return {
      accessToken,
      refreshToken,
    }
  }

  public async users({ page, sortBy }: GetUsers) {
    const users = await this.dbService.getUsers({ page, sortBy })
    return {
      users: users.map(({ password: _, ...user }) => {
        return user
      }),
    }
  }
}
