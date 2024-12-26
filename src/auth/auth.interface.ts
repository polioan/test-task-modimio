export type Id = number

export interface IAuth {
  generateAccessToken: (id: Id) => Promise<string> | string
  decodeAccessToken: (token: string) => Promise<Id> | Id
  generateRefreshToken: (id: Id) => Promise<string> | string
  removeRefreshTokens: (id: Id) => Promise<void> | void
}
