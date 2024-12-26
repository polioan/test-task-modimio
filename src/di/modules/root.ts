import { ContainerModule } from 'inversify'
import { types } from '../dependency-types.js'

import type { IEnv } from '../../env/env.interface.js'
import { EnvService } from '../../env/env.service.js'

import type { IServer, Controller } from '../../server/server.interface.js'
import { ServerService } from '../../server/server.service.js'

import type { ICache } from '../../cache/cache.interface.js'
import { CacheService } from '../../cache/cache.service.js'

import type { ILogger } from '../../logger/logger.interface.js'
import { LoggerService } from '../../logger/logger.service.js'

import type { IDb } from '../../db/db.interface.js'
import { DbService } from '../../db/db.service.js'

import type { IJwt } from '../../jwt/jwt.interface.js'
import { JwtService } from '../../jwt/jwt.service.js'

import type { IAuth } from '../../auth/auth.interface.js'
import { AuthService } from '../../auth/auth.service.js'

import type { IHash } from '../../hash/hash.interface.js'
import { HashService } from '../../hash/hash.service.js'

import type { IRegistrable } from '../../types/registrable.js'

import { UserService } from '../../user/user.service.js'
import { UserMiddleware } from '../../user/user.middleware.js'
import { UserController } from '../../user/user.controller.js'

import { AdminService } from '../../admin/admin.service.js'
import { AdminMiddleware } from '../../admin/admin.middleware.js'
import { AdminController } from '../../admin/admin.controller.js'

export const rootModule = new ContainerModule(bind => {
  bind<IEnv>(types.Env).to(EnvService).inSingletonScope()
  bind<IServer>(types.Server).to(ServerService).inSingletonScope()
  bind<ICache>(types.Cache).to(CacheService).inSingletonScope()
  bind<ILogger>(types.Logger).to(LoggerService).inSingletonScope()
  bind<IDb>(types.Db).to(DbService).inSingletonScope()
  bind<IJwt>(types.Jwt).to(JwtService).inSingletonScope()
  bind<IAuth>(types.Auth).to(AuthService).inSingletonScope()
  bind<IHash>(types.Hash).to(HashService).inSingletonScope()

  bind(UserService).toSelf().inSingletonScope()
  bind(UserMiddleware).toSelf().inSingletonScope()
  bind<IRegistrable<Controller>>(UserController).toSelf().inSingletonScope()

  bind(AdminService).toSelf().inSingletonScope()
  bind(AdminMiddleware).toSelf().inSingletonScope()
  bind<IRegistrable<Controller>>(AdminController).toSelf().inSingletonScope()
})
