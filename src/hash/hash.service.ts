import { injectable } from 'inversify'
import type { IHash } from './hash.interface.js'
import argon2 from 'argon2'

@injectable()
export class HashService implements IHash {
  public async hash(payload: string) {
    const result = await argon2.hash(payload)
    return result
  }

  public async verify(left: string, right: string) {
    const result = await argon2.verify(left, right)
    return result
  }
}
