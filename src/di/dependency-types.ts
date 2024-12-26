const root = {
  Env: Symbol('Env'),
  Server: Symbol('Server'),
  Cache: Symbol('Cache'),
  Logger: Symbol('Logger'),
  Db: Symbol('Db'),
  Jwt: Symbol('Jwt'),
  Auth: Symbol('Auth'),
  Hash: Symbol('Hash'),
} as const satisfies Record<string, symbol>

export const types = {
  ...root,
} as const
