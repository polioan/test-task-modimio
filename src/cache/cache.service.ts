import { inject, injectable } from 'inversify'
import { types } from '../di/dependency-types.js'
import type { IEnv } from '../env/env.interface.js'
import { Redis } from 'ioredis'

@injectable()
export class CacheService {
  public readonly redis: Redis

  constructor(@inject(types.Env) private readonly envService: IEnv) {
    this.redis = new Redis(this.envService.get('CACHE_URL'), {
      lazyConnect: false,
    })

    this.redis.on('error', error => {
      throw new Error('Redis cache connection error.', {
        cause: error,
      })
    })
  }

  private cacheKey(key: string) {
    return `cache:${key}`
  }

  public async get(key: string) {
    const result = await this.redis.get(this.cacheKey(key))
    return result
  }

  public async set(key: string, value: string, ttl?: number | undefined) {
    if (typeof ttl === 'number') {
      await this.redis.set(this.cacheKey(key), value, 'PX', ttl)
    } else {
      await this.redis.set(this.cacheKey(key), value)
    }
  }

  public async del(key: string) {
    await this.redis.del(this.cacheKey(key))
  }

  public async getJSON<T>(key: string) {
    const result = await this.get(key)
    if (result == null) {
      return null
    }
    return JSON.parse(result) as T
  }

  public async setJSON(key: string, value: unknown, ttl?: number | undefined) {
    await this.set(key, JSON.stringify(value), ttl)
  }
}
