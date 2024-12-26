import { inject, injectable } from 'inversify'
import { types } from '../di/dependency-types.js'
import jwt from 'jsonwebtoken'
import type { IJwt, SignOptions } from './jwt.interface.js'
import type { IEnv } from '../env/env.interface.js'

@injectable()
export class JwtService implements IJwt {
  private readonly secret: string

  constructor(@inject(types.Env) private readonly envService: IEnv) {
    this.secret = this.envService.get('JWT_SECRET')
  }

  public async sign(
    payload: string | Buffer | object,
    signOptions: SignOptions | undefined = {}
  ) {
    return jwt.sign(payload, this.secret, {
      ...(typeof signOptions.expiresIn === 'undefined'
        ? {}
        : { expiresIn: signOptions.expiresIn }),
    })
  }

  public async verify<T>(token: string) {
    return jwt.verify(token.replace('Bearer ', ''), this.secret) as T
  }
}
