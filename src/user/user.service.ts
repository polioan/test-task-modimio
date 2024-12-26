import { inject, injectable } from 'inversify'
import type * as schema from '../db/db.schema.js'
import type { Login, Me, Register } from './user.schema.js'
import { types } from '../di/dependency-types.js'
import type { IAuth } from '../auth/auth.interface.js'
import type { IDb } from '../db/db.interface.js'
import { ApiError } from '../api-error/api-error.class.js'
import type { IHash } from '../hash/hash.interface.js'
import { Unauthorized } from '../api-error/api-error.common.js'

@injectable()
export class UserService {
  constructor(
    @inject(types.Auth) private readonly authService: IAuth,
    @inject(types.Db) private readonly dbService: IDb,
    @inject(types.Hash) private readonly hashService: IHash
  ) {}

  private async getByLoginOrEmail(loginData: Login) {
    if ('login' in loginData) {
      const user = await this.dbService.getUserByLogin(loginData.login)
      return user
    } else {
      const user = await this.dbService.getUserByEmail(loginData.email)
      return user
    }
  }

  public async login(loginData: Login) {
    const user = await this.getByLoginOrEmail(loginData)
    if (!user) {
      throw Unauthorized
    }
    const isPasswordCorrect = await this.hashService.verify(
      user.password,
      loginData.password
    )
    if (!isPasswordCorrect) {
      throw Unauthorized
    }
    const accessToken = await this.authService.generateAccessToken(user.id)
    const refreshToken = await this.authService.generateRefreshToken(user.id)
    return {
      accessToken,
      refreshToken,
    }
  }

  public async register({ email, login, password }: Register) {
    const userByEmail = await this.dbService.getUserByEmail(email)
    if (userByEmail) {
      throw new ApiError({
        message: 'The email is occupied by another user!',
        status: 'BAD_REQUEST',
      })
    }
    const userByLogin = await this.dbService.getUserByLogin(login)
    if (userByLogin) {
      throw new ApiError({
        message: 'The login is occupied by another user!',
        status: 'BAD_REQUEST',
      })
    }
    const hashedPassword = await this.hashService.hash(password)
    const { id } = await this.dbService.registerUser({
      email,
      login,
      password: hashedPassword,
    })
    const accessToken = await this.authService.generateAccessToken(id)
    const refreshToken = await this.authService.generateRefreshToken(id)
    return {
      accessToken,
      refreshToken,
    }
  }

  public async me({ login, emailVerifiedAt }: schema.User): Promise<Me> {
    return {
      login,
      confirmed: Boolean(emailVerifiedAt),
    }
  }

  public async logout({ id }: schema.User) {
    await this.authService.removeRefreshTokens(id)
  }

  public async refresh(token: string) {
    const refresh = await this.dbService.findRefreshToken(token)
    if (!refresh || new Date() > refresh.expiresAt) {
      throw Unauthorized
    }
    const user = await this.dbService.getUserById(refresh.userId)
    if (!user) {
      throw Unauthorized
    }
    await this.dbService.removeRefreshTokens(user.id)
    const accessToken = await this.authService.generateAccessToken(user.id)
    const refreshToken = await this.authService.generateRefreshToken(user.id)
    return {
      accessToken,
      refreshToken,
    }
  }
}
