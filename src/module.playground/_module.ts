import { Global, Module, OnApplicationBootstrap } from '@nestjs/common'
import { PlaygroundToken } from '@src/module.playground/playground.token'
import { PlaygroundDex } from '@src/module.playground/playground.dex'
import { PlaygroundProbeIndicator } from '@src/module.playground/playground.indicator'
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
    await this.waitForDeFiD()
    await this.client.call('importprivkey', [Playground.MN_KEY.owner.privKey, 'coinbase'], 'number')
    await this.client.call('importprivkey', [Playground.MN_KEY.operator.privKey, 'coinbase'], 'number')

    await this.token.init()
    await this.dex.init()
    this.indicator.ready = true
  }

  async waitForDeFiD (timeout = 15000): Promise<void> {
    const expiredAt = Date.now() + timeout

    return await new Promise((resolve, reject) => {
      const loop = (): void => {
        this.client.blockchain.getBlockCount().then(() => {
          resolve()
        }).catch(err => {
          if (expiredAt < Date.now()) {
            reject(new Error(`DeFiD not ready within given timeout of ${timeout}ms.\n${err.message as string}`))
          } else {
            setTimeout(() => loop(), 200)
          }
        })
      }

      loop()
    })
  }
}
