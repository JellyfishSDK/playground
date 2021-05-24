import { Playground } from '@src/module.playground/playground'
import { Injectable } from '@nestjs/common'
import { AddPoolLiquiditySource, CreatePoolPairMetadata } from '@defichain/jellyfish-api-core/dist/category/poolpair'

@Injectable()
export class PlaygroundDex extends Playground {
  private readonly pairs: Array<{
    create: CreatePoolPairMetadata
    add: AddPoolLiquiditySource
  }> = [
    {
      create: {
        tokenA: 'DFI',
        tokenB: 'tBTC',
        commission: 0,
        status: true,
        ownerAddress: Playground.address
      },
      add: {
        '*': ['1000@DFI', '1000@tBTC']
      }
    },
    {
      create: {
        tokenA: 'DFI',
        tokenB: 'tETH',
        commission: 0,
        status: true,
        ownerAddress: Playground.address
      },
      add: {
        '*': ['100@DFI', '1000@tETH']
      }
    },
    {
      create: {
        tokenA: 'DFI',
        tokenB: 'tUSD',
        commission: 0,
        status: true,
        ownerAddress: Playground.address
      },
      add: {
        '*': ['100@DFI', '100000@tUSD']
      }
    },
    {
      create: {
        tokenA: 'tBTC',
        tokenB: 'tUSD',
        commission: 0,
        status: true,
        ownerAddress: Playground.address
      },
      add: {
        '*': ['100@tBTC', '100000@tUSD']
      }
    },
    {
      create: {
        tokenA: 'tLTC',
        tokenB: 'tUSD',
        commission: 0,
        status: true,
        ownerAddress: Playground.address
      },
      add: {
        '*': ['1000@tLTC', '100000@tUSD']
      }
    }
  ]

  public async init (): Promise<void> {
    await this.waitForBalance(2001)
    await this.client.account.utxosToAccount({
      [Playground.address]: '2000@0'
    })
    await this.generate(1)

    for (const pair of this.pairs) {
      await this.client.poolpair.createPoolPair(pair.create)
      await this.generate(1)
      await this.client.poolpair.addPoolLiquidity(pair.add, Playground.address)
      await this.generate(1)
    }
  }
}
