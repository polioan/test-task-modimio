import { inject, injectable } from 'inversify'
import type { IAuth, Id } from './auth.interface.js'
import { types } from '../di/dependency-types.js'
import type { IJwt } from '../jwt/jwt.interface.js'
import type { IDb } from '../db/db.interface.js'
import { v4 as uuid } from 'uuid'

@injectable()
export class AuthService implements IAuth {
  constructor(
    @inject(types.Jwt) private readonly jwtService: IJwt,
    @inject(types.Db) private readonly dbService: IDb
  ) {}

  public async generateAccessToken(id: Id) {
    const payload = {
      id,
    } as const
    const result = await this.jwtService.sign(payload, {
      expiresIn: '15m',
    })
    return result
  }

  public async decodeAccessToken(token: string) {
    const decoded = await this.jwtService.verify<{ id: Id }>(token)
    return decoded.id
  }

  public async generateRefreshToken(id: Id) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // + 7 days

    const result = await this.dbService.createRefreshToken({
      expiresAt,
      userId: id,
      token: uuid(),
    })
    return result
  }

  public async removeRefreshTokens(id: Id) {
    await this.dbService.removeRefreshTokens(id)
  }
}
