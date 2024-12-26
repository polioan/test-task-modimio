import { inject, injectable } from 'inversify'
import type { IRegistrable } from '../types/registrable.js'
import type { Controller } from '../server/server.interface.js'
import { UserService } from './user.service.js'
import { UserMiddleware } from './user.middleware.js'
import { loginSchema, meSchema, registerSchema } from './user.schema.js'
import { status } from '@polioan/http-status'
import { tokensSchema } from '../auth/auth.schema.js'
import { z } from 'zod'

@injectable()
export class UserController implements IRegistrable<Controller> {
  constructor(
    @inject(UserService) private readonly userService: UserService,
    @inject(UserMiddleware) private readonly userMiddleware: UserMiddleware
  ) {}

  public async register(): Promise<Controller> {
    return async server => {
      server.post(
        '/user/login',
        {
          schema: {
            body: loginSchema,
            tags: ['user'],
            response: {
              [status.OK]: tokensSchema,
            },
          },
        },
        async (request, reply) => {
          await reply
            .status(status.OK)
            .send(await this.userService.login(request.body))
        }
      )

      server.post(
        '/user/register',
        {
          schema: {
            body: registerSchema,
            tags: ['user'],
            response: {
              [status.OK]: tokensSchema,
            },
          },
        },
        async (request, reply) => {
          await reply
            .status(status.OK)
            .send(await this.userService.register(request.body))
        }
      )

      server.get(
        '/user/me',
        {
          preHandler: [await this.userMiddleware.register()],
          schema: {
            tags: ['user'],
            security: [
              {
                userAuth: [],
              },
            ],
            response: {
              [status.OK]: meSchema,
            },
          },
        },
        async (request, reply) => {
          await reply
            .status(status.OK)
            .send(await this.userService.me(request.user))
        }
      )

      server.delete(
        '/user/logout',
        {
          preHandler: [await this.userMiddleware.register()],
          schema: {
            tags: ['user'],
            security: [
              {
                userAuth: [],
              },
            ],
            response: {
              [status.OK]: z.object({}).passthrough(),
            },
          },
        },
        async (request, reply) => {
          await this.userService.logout(request.user)
          await reply.status(status.OK).send({})
        }
      )

      server.post(
        '/user/refresh',
        {
          schema: {
            body: z.object({
              refresh: z.string(),
            }),
            tags: ['user'],
            response: {
              [status.OK]: tokensSchema,
            },
          },
        },
        async (request, reply) => {
          await reply
            .status(status.OK)
            .send(await this.userService.refresh(request.body.refresh))
        }
      )
    }
  }
}
