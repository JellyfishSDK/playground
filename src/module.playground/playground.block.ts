import { Interval } from '@nestjs/schedule'
import { Injectable } from '@nestjs/common'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { Playground } from '@src/module.playground/playground'

@Injectable()
export class PlaygroundBlock {
  constructor (private readonly client: JsonRpcClient) {
  }

  @Interval(3000)
  async generate (): Promise<void> {
    await this.client.call('generatetoaddress', [1, Playground.address, 1], 'number')
  }
}
