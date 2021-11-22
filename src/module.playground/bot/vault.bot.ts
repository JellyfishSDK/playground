import { Injectable } from '@nestjs/common'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { Interval } from '@nestjs/schedule'
import { PlaygroundSetup } from '@src/module.playground/setup/setup'

@Injectable()
export class VaultBot {
  private vaultId?: string

  constructor (protected readonly client: JsonRpcClient) {
  }

  @Interval(6000)
  async run (): Promise<void> {
    if (this.vaultId === undefined) {
      this.vaultId = await this.client.loan.createVault({
        loanSchemeId: 'MIN200',
        ownerAddress: PlaygroundSetup.address
      })
      return
    }

    await this.client.account.utxosToAccount({
      [PlaygroundSetup.address]: '20@0'
    })

    await this.client.loan.depositToVault({
      amount: '10@DFI',
      from: PlaygroundSetup.address,
      vaultId: this.vaultId
    })

    await this.client.loan.takeLoan({
      amounts: [
        '20@DUSD',
        '0.1@TS25'
      ],
      to: PlaygroundSetup.address,
      vaultId: this.vaultId
    })

    await this.client.poolpair.addPoolLiquidity({
      '*': ['1@DFI', '10@DUSD']
    }, PlaygroundSetup.address)
    await this.client.poolpair.addPoolLiquidity({
      '*': ['2.5@DUSD', '0.1@TS25']
    }, PlaygroundSetup.address)
  }
}
