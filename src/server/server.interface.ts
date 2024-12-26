import type { FastifyRequest, FastifyReply } from 'fastify'
import type { ServerService } from './server.service.js'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export type IServer = ServerService

export type Controller = FastifyPluginAsyncZod

export type Middleware = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<void>
