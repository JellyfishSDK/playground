import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { AddPoolLiquiditySource, CreatePoolPairMetadata } from '@defichain/jellyfish-api-core/dist/category/poolpair'

interface PoolPairSetup {
  symbol: `${string}-${string}`
  create: CreatePoolPairMetadata
  add: AddPoolLiquiditySource
}

@Injectable()
export class SetupDex extends PlaygroundSetup<PoolPairSetup> {
  list (): PoolPairSetup[] {
    return [
      {
        symbol: 'DFI-tBTC',
        create: {
          tokenA: 'DFI',
          tokenB: 'tBTC',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['1000@DFI', '1000@tBTC']
        }
      },
      {
        symbol: 'DFI-tETH',
        create: {
          tokenA: 'DFI',
          tokenB: 'tETH',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['100@DFI', '1000@tETH']
        }
      },
      {
        symbol: 'DFI-tUSD',
        create: {
          tokenA: 'DFI',
          tokenB: 'tUSD',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['100@DFI', '100000@tUSD']
        }
      },
      {
        symbol: 'tBTC-tUSD',
        create: {
          tokenA: 'tBTC',
          tokenB: 'tUSD',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['100@tBTC', '100000@tUSD']
        }
      },
      {
        symbol: 'tLTC-tUSD',
        create: {
          tokenA: 'tLTC',
          tokenB: 'tUSD',
          commission: 0,
          status: true,
          ownerAddress: PlaygroundSetup.address
        },
        add: {
          '*': ['1000@tLTC', '100000@tUSD']
        }
      }
    ]
  }

  protected async before (list: PoolPairSetup[]): Promise<void> {
    await this.waitForBalance(2001)
    await this.client.account.utxosToAccount({ [PlaygroundSetup.address]: '2000@0' })
    await this.generate(1)

    return await super.before(list)
  }

  async has (each: PoolPairSetup): Promise<boolean> {
    const result = await this.client.poolpair.getPoolPair(each.symbol)
    return Object.values(result).length >= 1
  }

  async create (each: PoolPairSetup): Promise<void> {
    await this.client.poolpair.createPoolPair(each.create)
    await this.generate(1)

    await this.client.poolpair.addPoolLiquidity(each.add, PlaygroundSetup.address)
    await this.generate(1)
  }
}
