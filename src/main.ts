import './polyfills/polyfills.bootstrap.js'

import { container } from './di/container.js'
import { types } from './di/dependency-types.js'

import type { IServer, Controller } from './server/server.interface.js'
import type { IRegistrable } from './types/registrable.js'

import { UserController } from './user/user.controller.js'
import { AdminController } from './admin/admin.controller.js'

import type { IDb } from './db/db.interface.js'

const serverService = await container.getAsync<IServer>(types.Server)

async function getControllers() {
  const result: Controller[] = []

  for (const type of [UserController, AdminController]) {
    const controller = await container.getAsync<IRegistrable<Controller>>(type)
    result.push(await controller.register())
  }

  return result
}

const dbService = await container.getAsync<IDb>(types.Db)

await dbService.launch()

await serverService.launch({
  controllers: await getControllers(),
})
