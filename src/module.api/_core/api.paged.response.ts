import { ApiResponse } from '@src/module.api/_core/api.response'

/**
 * ApiPage for pagination ApiPagedResponse pagination
 * - `next` token indicate the token used to get the next slice window.
 */
export interface ApiPage {
  next?: string
}

export class ApiPagedResponse<T> implements ApiResponse {
  data: T[]
  page?: ApiPage

  private constructor (data: T[], next?: string) {
    this.data = data
    this.page = next !== undefined ? { next } : undefined
  }

  /**
   * @param {T[]} data array slice
   * @param {string} next token slice for greater than, less than operator
   */
  static next<T> (data: T[], next?: string): ApiPagedResponse<T> {
    return new ApiPagedResponse<T>(data, next)
  }

  /**
   * @param {T[]} data array slice
   * @param {number} limit number of elements in the data array slice
   * @param {(item: T) => string} nextProvider to get next token when (limit === data array slice)
   */
  static of<T> (data: T[], limit: number, nextProvider: (item: T) => string): ApiPagedResponse<T> {
    if (data.length === limit) {
      const next = nextProvider(data[limit - 1])
      return this.next(data, next)
    }

    return this.next(data)
  }
}
