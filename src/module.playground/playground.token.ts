import { Playground } from '@src/module.playground/playground'
import { Injectable } from '@nestjs/common'
import { CreateTokenMetadata } from '@defichain/jellyfish-api-core/dist/category/token'

@Injectable()
export class PlaygroundToken extends Playground {
  private readonly tokens: Array<{
    create: CreateTokenMetadata
    amount: number
  }> = [
    {
      create: {
        symbol: 'tBTC',
        name: 'Playground BTC',
        isDAT: true,
        mintable: true,
        tradeable: true,
        collateralAddress: Playground.address
      },
      amount: 10000
    },
    {
      create: {
        symbol: 'tETH',
        name: 'Playground ETH',
        isDAT: true,
        mintable: true,
        tradeable: true,
        collateralAddress: Playground.address
      },
      amount: 100000
    },
    {
      create: {
        symbol: 'tUSD',
        name: 'Playground USD',
        isDAT: true,
        mintable: true,
        tradeable: true,
        collateralAddress: Playground.address
      },
      amount: 10000000
    },
    {
      create: {
        symbol: 'tLTC',
        name: 'Playground LTC',
        isDAT: true,
        mintable: true,
        tradeable: true,
        collateralAddress: Playground.address
      },
      amount: 10000
    }
  ]

  public async init (): Promise<void> {
    for (const token of this.tokens) {
      await this.waitForBalance(101)
      await this.client.token.createToken(token.create)
      await this.generate(1)
      await this.client.call('minttokens', [`${token.amount}@${token.create.symbol}`], 'number')
      await this.generate(1)
    }
  }
}
