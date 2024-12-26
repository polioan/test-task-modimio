import '../polyfills/polyfills.bootstrap.js'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { container } from '../di/container.js'
import { types } from '../di/dependency-types.js'
import path from 'node:path'
import type { IDb } from './db.interface.js'

const dbService = await container.getAsync<IDb>(types.Db)

await dbService.launch()

await migrate(dbService.db, {
  migrationsFolder: path.join(import.meta.dirname, 'migrations'),
})

await dbService.client.end()

process.exit(0)
