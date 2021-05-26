import { Global, Module, OnApplicationBootstrap } from '@nestjs/common'
import { SetupToken } from '@src/module.playground/setup/setup.token'
import { SetupDex } from '@src/module.playground/setup/setup.dex'
import { PlaygroundProbeIndicator } from '@src/module.playground/playground.indicator'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { PlaygroundBlock } from '@src/module.playground/playground.block'
import { PlaygroundSetup } from '@src/module.playground/setup/setup'

@Global()
@Module({
  providers: [
    SetupToken,
    SetupDex,
    PlaygroundBlock,
    PlaygroundProbeIndicator
  ],
  exports: [
    PlaygroundProbeIndicator
  ]
})
export class PlaygroundModule implements OnApplicationBootstrap {
  private readonly setups: Array<PlaygroundSetup<any>>

  constructor (
    private readonly client: JsonRpcClient,
    private readonly indicator: PlaygroundProbeIndicator,
    token: SetupToken, dex: SetupDex
  ) {
    this.setups = [
      token,
      dex
    ]
  }

  async onApplicationBootstrap (): Promise<void> {
    await this.waitForDeFiD()
    await this.client.call('importprivkey', [PlaygroundSetup.MN_KEY.owner.privKey, 'coinbase'], 'number')
    await this.client.call('importprivkey', [PlaygroundSetup.MN_KEY.operator.privKey, 'coinbase'], 'number')

    for (const setup of this.setups) {
      await setup.setup()
    }

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
