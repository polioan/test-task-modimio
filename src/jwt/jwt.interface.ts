export interface SignOptions {
  expiresIn?: string | number | undefined
}

export interface IJwt {
  sign: (
    payload: string | Buffer | object,
    signOptions?: SignOptions | undefined
  ) => Promise<string> | string
  verify: <T>(token: string) => Promise<T> | T
}
