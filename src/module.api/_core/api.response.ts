import { ApiError } from '@src/module.api/_core/api.error'

/**
 * Universal response structure for 'module.api'
 */
export interface ApiResponse {
  data?: any
  error?: ApiError
}
