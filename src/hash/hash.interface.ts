export interface IHash {
  hash: (payload: string) => Promise<string> | string
  verify: (left: string, right: string) => Promise<boolean> | boolean
}
