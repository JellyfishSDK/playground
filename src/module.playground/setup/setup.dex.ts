import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { AddPoolLiquiditySource, CreatePoolPairMetadata } from '@defichain/jellyfish-api-core/dist/category/poolpair'
import { BalanceTransferPayload } from '@defichain/jellyfish-api-core/dist/category/account'

interface PoolPairSetup {
  symbol: `${string}-${string}`
  create: CreatePoolPairMetadata
  add: AddPoolLiquiditySource
  utxoToAccount?: BalanceTransferPayload
}

@Injectable()
export class SetupDex extends PlaygroundSetup<PoolPairSetup> {
  list (): PoolPairSetup[] {
    // MAX_SYMBOL_LENGTH = 8
    return [
      {
        symbol: 'DFI-BTC',
        create: {
          tokenA: 'DFI',
          tokenB: 'BTC',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['1000@DFI', '1000@BTC']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '1000@0'
        }
      },
      {
        symbol: 'DFI-ETH',
        create: {
          tokenA: 'DFI',
          tokenB: 'ETH',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['1000@DFI', '100000@ETH']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '1000@0'
        }
      },
      {
        symbol: 'DFI-USDT',
        create: {
          tokenA: 'DFI',
          tokenB: 'USDT',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['1000@DFI', '10000000@USDT']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '1000@0'
        }
      },
      {
        symbol: 'DFI-LTC',
        create: {
          tokenA: 'DFI',
          tokenB: 'LTC',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['100@DFI', '10000@LTC']
        },
        utxoToAccount: {
          [PlaygroundSetup.address]: '100@0'
        }
      }
    ]
  }

  async create (each: PoolPairSetup): Promise<void> {
    if (each.utxoToAccount !== undefined) {
      const amount = Object.values(each.utxoToAccount)[0].replace('@0', '')
      await this.waitForBalance(Number(amount) + 1)
      await this.client.account.utxosToAccount(each.utxoToAccount)
      await this.generate(1)
    }

    await this.client.poolpair.createPoolPair(each.create)
    await this.generate(1)

    await this.client.poolpair.addPoolLiquidity(each.add, PlaygroundSetup.address)
    await this.generate(1)
  }

  async has (each: PoolPairSetup): Promise<boolean> {
    try {
      await this.client.poolpair.getPoolPair(each.symbol)
      return true
    } catch (e) {
      return false
    }
  }
}
