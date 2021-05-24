import { Global, Module, OnApplicationBootstrap } from '@nestjs/common'
import { PlaygroundToken } from '@src/module.playground/playground.token'
import { PlaygroundDex } from '@src/module.playground/playground.dex'
import { PlaygroundProbeIndicator } from '@src/module.playground/_indicator'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { PlaygroundBlock } from '@src/module.playground/playground.block'
import { Playground } from '@src/module.playground/playground'

@Global()
@Module({
  providers: [
    PlaygroundToken,
    PlaygroundDex,
    PlaygroundBlock,
    PlaygroundProbeIndicator
  ],
  exports: [
    PlaygroundProbeIndicator
  ]
})
export class PlaygroundModule implements OnApplicationBootstrap {
  constructor (
    private readonly token: PlaygroundToken,
    private readonly dex: PlaygroundDex,
    private readonly client: JsonRpcClient,
    private readonly indicator: PlaygroundProbeIndicator
  ) {
  }

  async onApplicationBootstrap (): Promise<void> {
    await this.client.call('importprivkey', [Playground.MN_KEY.owner.privKey], 'number')
    await this.client.call('importprivkey', [Playground.MN_KEY.operator.privKey], 'number')

    await this.token.init()
    await this.dex.init()
    this.indicator.ready = true
  }
}
