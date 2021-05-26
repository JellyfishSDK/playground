import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { CreateTokenMetadata } from '@defichain/jellyfish-api-core/dist/category/token'

interface TokenSetup {
  create: CreateTokenMetadata
  amount: number
}

@Injectable()
export class SetupToken extends PlaygroundSetup<TokenSetup> {
  list (): TokenSetup[] {
    return [
      {
        create: {
          symbol: 'tBTC',
          name: 'Playground BTC',
          isDAT: true,
          mintable: true,
          tradeable: true,
          collateralAddress: PlaygroundSetup.address
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
          collateralAddress: PlaygroundSetup.address
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
          collateralAddress: PlaygroundSetup.address
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
          collateralAddress: PlaygroundSetup.address
        },
        amount: 10000
      }
    ]
  }

  async create (each: TokenSetup): Promise<void> {
    await this.waitForBalance(101)
    await this.client.token.createToken(each.create)
    await this.generate(1)

    await this.client.call('minttokens', [`${each.amount}@${each.create.symbol}`], 'number')
    await this.generate(1)
  }

  async has (each: TokenSetup): Promise<boolean> {
    const result = await this.client.token.getToken(each.create.symbol)
    return Object.values(result).length >= 1
  }
}
