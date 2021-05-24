import { Global, Module, OnApplicationBootstrap } from '@nestjs/common'
import { PlaygroundToken } from '@src/module.playground/playground.token'
import { PlaygroundDex } from '@src/module.playground/playground.dex'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { Playground } from '@src/module.playground/playground'

@Global()
@Module({
  providers: [
    PlaygroundToken,
    PlaygroundDex
  ]
})
export class PlaygroundModule implements OnApplicationBootstrap {
  constructor (
    private readonly token: PlaygroundToken,
    private readonly dex: PlaygroundDex,
    private readonly client: JsonRpcClient
  ) {
  }

  async onApplicationBootstrap (): Promise<void> {
    await this.token.init()
    await this.dex.init()
    await this.waitForBlock(200)
  }

  async waitForBlock (count: number): Promise<void> {
    let current = await this.client.blockchain.getBlockCount()
    while (current <= count) {
      await this.client.call('generatetoaddress', [1, Playground.address, 1], 'number')
      current = await this.client.blockchain.getBlockCount()
    }
  }
}
