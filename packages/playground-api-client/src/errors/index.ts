import { PlaygroundApiValidationException } from './api.validation.exception'
import { PlaygroundApiErrorType, PlaygroundApiException } from './api.error'
import { PlaygroundApiResponse } from '../playground.api.response'

export * from './api.error'
export * from './api.validation.exception'
export * from './client.timeout.exception'

/**
 * @param {PlaygroundApiResponse} response to check and raise error if any
 * @throws {PlaygroundApiException} raised error
 */
export function raiseIfError (response: PlaygroundApiResponse<any>): void {
  const error = response.error
  if (error === undefined) {
    return
  }

  if (error.code === 422 && error.type === PlaygroundApiErrorType.ValidationError) {
    throw new PlaygroundApiValidationException(error)
  }

  throw new PlaygroundApiException(error)
}
