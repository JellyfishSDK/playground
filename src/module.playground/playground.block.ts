import { Interval } from '@nestjs/schedule'
import { Injectable } from '@nestjs/common'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { PlaygroundSetup } from '@src/module.playground/setup/setup'

@Injectable()
export class PlaygroundBlock {
  constructor (private readonly client: JsonRpcClient) {
  }

  @Interval(3000)
  async generate (): Promise<void> {
    await this.client.call('generatetoaddress', [1, PlaygroundSetup.address, 1], 'number')
  }
}
