import { PlaygroundApiException } from './api.error'
import { PlaygroundApiResponse } from '../playground.api.response'
import { Logger } from '@nestjs/common'

export * from './api.error'
export * from './client.timeout.exception'

const logger = new Logger(PlaygroundApiException.name)

/**
 * @param {PlaygroundApiResponse} response to check and raise error if any
 * @throws {PlaygroundApiException} raised error
 */
export function raiseIfError (response: PlaygroundApiResponse<any>): void {
  const error = response.error
  if (error === undefined) {
    return
  }

  logger.error(error)
  throw new PlaygroundApiException(error)
}
