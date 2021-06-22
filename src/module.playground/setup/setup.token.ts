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
          symbol: 'BTC',
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
          symbol: 'ETH',
          name: 'Playground ETH',
          isDAT: true,
          mintable: true,
          tradeable: true,
          collateralAddress: PlaygroundSetup.address
        },
        amount: 100000000
      },
      {
        create: {
          symbol: 'USDT',
          name: 'Playground USDT',
          isDAT: true,
          mintable: true,
          tradeable: true,
          collateralAddress: PlaygroundSetup.address
        },
        amount: 1000000000
      },
      {
        create: {
          symbol: 'LTC',
          name: 'Playground LTC',
          isDAT: true,
          mintable: true,
          tradeable: true,
          collateralAddress: PlaygroundSetup.address
        },
        amount: 100000
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
    try {
      await this.client.token.getToken(each.create.symbol)
      return true
    } catch (e) {
      return false
    }
  }
}
