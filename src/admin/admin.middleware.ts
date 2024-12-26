import { injectable, inject } from 'inversify'
import type { IRegistrable } from '../types/registrable.js'
import type { Middleware } from '../server/server.interface.js'
import type * as schema from '../db/db.schema.js'
import { Unauthorized } from '../api-error/api-error.common.js'
import { types } from '../di/dependency-types.js'
import type { IAuth } from '../auth/auth.interface.js'
import type { IDb } from '../db/db.interface.js'

declare module 'fastify' {
  interface FastifyRequest {
    admin: schema.Admin
  }
}

@injectable()
export class AdminMiddleware implements IRegistrable<Middleware> {
  constructor(
    @inject(types.Auth) private readonly authService: IAuth,
    @inject(types.Db) private readonly dbService: IDb
  ) {}

  public async register(): Promise<Middleware> {
    return async request => {
      try {
        const authorization =
          request.headers.authorization ?? request.headers.Authorization

        if (typeof authorization !== 'string') {
          throw Unauthorized
        }

        const id = await this.authService.decodeAccessToken(authorization)

        const admin = await this.dbService.getAdminById(id)

        if (!admin) {
          throw Unauthorized
        }

        request.admin = admin
      } catch {
        throw Unauthorized
      }
    }
  }
}
