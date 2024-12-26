import { inject, injectable } from 'inversify'
import { types } from '../di/dependency-types.js'
import Fastify, {
  type FastifyInstance,
  type RawServerDefault,
  type RawRequestDefaultExpression,
  type RawReplyDefaultExpression,
  type FastifyBaseLogger,
} from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type FastifyPluginAsyncZod,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import type { IEnv } from '../env/env.interface.js'
import type { ICache } from '../cache/cache.interface.js'
import type { ILogger } from '../logger/logger.interface.js'
import type { OpenAPIV3 } from 'openapi-types'
import { status } from '@polioan/http-status'
import { packageJson } from '../common/package-json.js'
import { ApiError } from '../api-error/api-error.class.js'

@injectable()
export class ServerService {
  public readonly server: FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    FastifyBaseLogger,
    ZodTypeProvider
  >

  constructor(
    @inject(types.Env) private readonly envService: IEnv,
    @inject(types.Cache) private readonly cacheService: ICache,
    @inject(types.Logger) private readonly loggerService: ILogger
  ) {
    this.server = Fastify({
      ignoreTrailingSlash: true,
      logger: true,
    }).withTypeProvider<ZodTypeProvider>()
  }

  public async launch({
    controllers,
  }: {
    controllers: FastifyPluginAsyncZod[]
  }) {
    this.server.setValidatorCompiler(validatorCompiler)
    this.server.setSerializerCompiler(serializerCompiler)

    await this.server.register(fastifyCors, {
      origin: this.envService.get('SERVER_CORS_ORIGINS'),
    })

    if (this.envService.isProduction) {
      await this.server.register(fastifyRateLimit, {
        global: true,
        redis: this.cacheService.redis,
      })
    }

    if (this.envService.get('OPENAPI') === 'on') {
      function transformResponses(
        responses: OpenAPIV3.OperationObject['responses']
      ) {
        const result = Object.fromEntries(
          Object.entries(responses).map(([key, value]) => {
            if (
              !('$ref' in value) &&
              value.content?.['application/json']?.schema &&
              !('$ref' in value.content['application/json'].schema)
            ) {
              value.content['application/json'].schema.required ??= []
              value.content['application/json'].schema.required.push('success')
              value.content['application/json'].schema.properties!.success = {
                type: 'boolean',
              }
              value.content['application/json'].schema.additionalProperties =
                false
            }
            return [key, value]
          })
        )
        for (const code of [
          status.BAD_REQUEST,
          status.UNAUTHORIZED,
          status.FORBIDDEN,
          status.INTERNAL_SERVER_ERROR,
          status.NOT_IMPLEMENTED,
          status.BAD_GATEWAY,
          status.SERVICE_UNAVAILABLE,
          status.GATEWAY_TIMEOUT,
        ].map(code => {
          return String(code)
        })) {
          result[code] = {
            description: 'Error',
          }
        }
        return result
      }

      await this.server.register(fastifySwagger, {
        openapi: {
          openapi: '3.0.0',
          info: {
            title: packageJson.name,
            version: packageJson.version,
            description: `${packageJson.name} API`,
          },
          components: {
            securitySchemes: {
              userAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
              },
              adminAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
              },
            },
          },
        },
        transform: jsonSchemaTransform,
        transformObject(payload) {
          if ('openapiObject' in payload) {
            payload.openapiObject.paths ??= {}
            payload.openapiObject.paths = Object.fromEntries(
              Object.entries(payload.openapiObject.paths).map(
                ([key, value]) => {
                  if (value?.get) {
                    value.get.responses = transformResponses(
                      value.get.responses
                    )
                  }
                  if (value?.post) {
                    value.post.responses = transformResponses(
                      value.post.responses
                    )
                  }
                  if (value?.put) {
                    value.put.responses = transformResponses(
                      value.put.responses
                    )
                  }
                  if (value?.delete) {
                    value.delete.responses = transformResponses(
                      value.delete.responses
                    )
                  }
                  if (value?.patch) {
                    value.patch.responses = transformResponses(
                      value.patch.responses
                    )
                  }
                  return [key, value]
                }
              )
            )
            return payload.openapiObject
          } else {
            return payload.swaggerObject
          }
        },
      })
    }

    this.server.addHook('preSerialization', async (request, reply, payload) => {
      if (
        typeof payload === 'object' &&
        !Array.isArray(payload) &&
        payload != null
      ) {
        if (request.url.endsWith('.json')) {
          return payload
        }
        return Object.assign(payload, {
          success: reply.statusCode >= 200 && reply.statusCode <= 299,
        })
      } else {
        reply.statusCode = status.INTERNAL_SERVER_ERROR
        const message = 'Internal server error! Invalid route response.'
        this.loggerService.error(message, request.url, payload)
        return {
          success: false,
          message,
        }
      }
    })

    this.server.setErrorHandler(async (error, _request, reply) => {
      if (error instanceof ApiError) {
        await reply.status(error.status).send({
          message: error.message,
        })
        return
      }
      if (error.statusCode === status.TOO_MANY_REQUESTS) {
        await reply.status(status.TOO_MANY_REQUESTS).send({
          message: 'Too many requests.',
        })
        return
      }
      if (error.statusCode === status.REQUEST_ENTITY_TOO_LARGE) {
        await reply.status(status.REQUEST_ENTITY_TOO_LARGE).send({
          message: 'Request entity too large.',
        })
        return
      }
      if (hasZodFastifySchemaValidationErrors(error)) {
        await reply.status(status.BAD_REQUEST).send({
          message: 'Request validation error.',
          issues: error.validation,
        })
        return
      }
      this.loggerService.error('Internal server error!', error)
      await reply.status(status.INTERNAL_SERVER_ERROR).send({
        message: 'Internal server error!',
      })
    })

    if (this.envService.get('OPENAPI') === 'on') {
      await this.server.register(fastifySwaggerUI, {
        routePrefix: '/api/openapi',
        uiHooks: {},
        theme: {},
        uiConfig: {
          requestInterceptor: async function requestInterceptor(request) {
            console.info('Intercepting request:', request)
            return request
          },
        },
      })
    }

    for (const controller of controllers) {
      await this.server.register(controller, {
        prefix: '/api',
      })
    }

    this.server.setNotFoundHandler(async (_request, reply) => {
      await reply.status(status.NOT_FOUND).send({
        message: 'Not found.',
      })
    })

    await this.server.listen({
      port: this.envService.get('SERVER_PORT'),
      host: this.envService.get('SERVER_HOST'),
    })
  }
}
