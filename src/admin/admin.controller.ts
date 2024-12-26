import { inject, injectable } from 'inversify'
import type { IRegistrable } from '../types/registrable.js'
import type { Controller } from '../server/server.interface.js'
import { AdminService } from './admin.service.js'
import { AdminMiddleware } from './admin.middleware.js'
import { loginSchema } from './admin.schema.js'
import { tokensSchema } from '../auth/auth.schema.js'
import { status } from '@polioan/http-status'
import { z } from 'zod'

@injectable()
export class AdminController implements IRegistrable<Controller> {
  constructor(
    @inject(AdminService) private readonly adminService: AdminService,
    @inject(AdminMiddleware) private readonly adminMiddleware: AdminMiddleware
  ) {}

  public async register(): Promise<Controller> {
    return async server => {
      server.post(
        '/admin/login',
        {
          schema: {
            body: loginSchema,
            tags: ['admin'],
            response: {
              [status.OK]: tokensSchema,
            },
          },
        },
        async (request, reply) => {
          await reply
            .status(status.OK)
            .send(await this.adminService.login(request.body))
        }
      )

      server.delete(
        '/admin/logout',
        {
          preHandler: [await this.adminMiddleware.register()],
          schema: {
            tags: ['admin'],
            security: [
              {
                adminAuth: [],
              },
            ],
            response: {
              [status.OK]: z.object({}).passthrough(),
            },
          },
        },
        async (request, reply) => {
          await this.adminService.logout(request.admin)
          await reply.status(status.OK).send({})
        }
      )

      server.post(
        '/admin/refresh',
        {
          schema: {
            body: z.object({
              refresh: z.string(),
            }),
            tags: ['admin'],
            response: {
              [status.OK]: tokensSchema,
            },
          },
        },
        async (request, reply) => {
          await reply
            .status(status.OK)
            .send(await this.adminService.refresh(request.body.refresh))
        }
      )
    }
  }
}
