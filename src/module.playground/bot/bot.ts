import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { Injectable, Logger } from '@nestjs/common'
import { GenesisKeys } from '@defichain/testcontainers'
import { Interval } from '@nestjs/schedule'

@Injectable()
export abstract class PlaygroundBot<Each> {
  static MN_KEY = GenesisKeys[0]

  /**
   * @return {string} address that should be used for everything
   */
  static get address (): string {
    return PlaygroundBot.MN_KEY.operator.address
  }

  /**
   * @return {string} privKey that should be used for everything
   */
  static get privKey (): string {
    return PlaygroundBot.MN_KEY.operator.privKey
  }

  private readonly logger = new Logger(PlaygroundBot.name)

  constructor (protected readonly client: JsonRpcClient) {
  }

  @Interval(3000)
  async runAll (): Promise<void> {
    const list = this.list()
    for (const each of list) {
      await this.run(each)
    }
  }

  /**
   * @return {Each[]} to run
   */
  abstract list (): Each[]

  /**
   * @param {Each} each to run
   */
  abstract run (each: Each): Promise<void>
}
