import '../polyfills/polyfills.bootstrap.js'
import { container } from '../di/container.js'
import { types } from '../di/dependency-types.js'
import type { IDb } from '../db/db.interface.js'
import { AdminService } from './admin.service.js'
import readline from 'node:readline/promises'

const dbService = await container.getAsync<IDb>(types.Db)

await dbService.launch()

const adminService = await container.getAsync<AdminService>(AdminService)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const email = await rl.question('Admin email: ')
const password = await rl.question('Admin password: ')

await adminService.register({ email, password })

rl.close()

await dbService.client.end()

process.exit(0)
