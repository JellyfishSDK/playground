import { Global, Logger, Module, OnApplicationBootstrap } from '@nestjs/common'
import { SetupToken } from '@src/module.playground/setup/setup.token'
import { SetupDex } from '@src/module.playground/setup/setup.dex'
import { SetupOracle } from '@src/module.playground/setup/setup.oracle'
import { PlaygroundProbeIndicator } from '@src/module.playground/playground.indicator'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { PlaygroundBlock } from '@src/module.playground/playground.block'
import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { GenesisKeys } from '@defichain/testcontainers'
import { SetupMasternode } from '@src/module.playground/setup/setup.masternode'

@Global()
@Module({
  providers: [
    SetupToken,
    SetupDex,
    SetupOracle,
    SetupMasternode,
    PlaygroundBlock,
    PlaygroundProbeIndicator
  ],
  exports: [
    PlaygroundProbeIndicator
  ]
})
export class PlaygroundModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(PlaygroundModule.name)

  private readonly setups: Array<PlaygroundSetup<any>>

  constructor (
    private readonly client: JsonRpcClient,
    private readonly indicator: PlaygroundProbeIndicator,
    token: SetupToken,
    dex: SetupDex,
    oracle: SetupOracle,
    masternode: SetupMasternode
  ) {
    this.setups = [
      token,
      dex,
      oracle,
      masternode
    ]
  }

  async onApplicationBootstrap (): Promise<void> {
    await this.waitForDeFiD()
    await this.importPrivKey()

    for (const setup of this.setups) {
      await setup.setup()
    }

    this.logger.log('setup completed')
    this.indicator.ready = true
  }

  async importPrivKey (): Promise<void> {
    this.logger.log('importing private keys')

    if (await this.client.blockchain.getBlockCount() > 0) {
      return
    }

    for (const genesisKey of GenesisKeys) {
      await this.client.wallet.importPrivKey(genesisKey.owner.privKey, undefined, false)
      await this.client.wallet.importPrivKey(genesisKey.operator.privKey, undefined, false)
    }
  }

  async waitForDeFiD (timeout = 45000): Promise<void> {
    const expiredAt = Date.now() + timeout

    while (expiredAt > Date.now()) {
      try {
        const info = await this.client.blockchain.getBlockchainInfo()
        if (info.blocks === 0) {
          return
        }
        if (!info.initialblockdownload) {
          return
        }
      } catch (err) {
      }
      await new Promise((resolve) => {
        setTimeout(_ => resolve(0), 1000)
      })
    }

    throw new Error(`DeFiD not ready within given timeout of ${timeout}ms.`)
  }
}
