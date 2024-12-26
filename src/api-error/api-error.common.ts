import { ApiError } from './api-error.class.js'

export const Unauthorized = new ApiError({
  message: 'Unauthorized!',
  status: 'UNAUTHORIZED',
})
