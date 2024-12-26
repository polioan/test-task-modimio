import { Status } from '@polioan/http-status'

export interface ApiErrorOptions {
  message: string
  cause?: unknown
  status: keyof typeof Status
}

export class ApiError extends Error {
  public readonly status: number

  constructor({ message, cause, status }: ApiErrorOptions) {
    super(message)

    if (typeof cause !== 'undefined') {
      this.cause = cause
    }

    this.status = Status[status]

    this.name = 'ApiError'
  }
}
