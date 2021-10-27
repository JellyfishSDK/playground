import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { AppointOracleOptions, OraclePriceFeed } from '@defichain/jellyfish-api-core/dist/category/oracle'
import { GenesisKeys } from '@defichain/testcontainers'

interface OracleSetup {
  address: string
  priceFeeds: OraclePriceFeed[]
  options: AppointOracleOptions
}

const STOCKS: OraclePriceFeed[] = [
  {
    token: 'TSLA',
    currency: 'USD'
  },
  {
    token: 'AAPL',
    currency: 'USD'
  },
  {
    token: 'FB',
    currency: 'USD'
  }
]

const BOTS: OraclePriceFeed[] = [
  {
    token: 'U10',
    currency: 'USD'
  },
  {
    token: 'U25',
    currency: 'USD'
  },
  {
    token: 'U50',
    currency: 'USD'
  },
  {
    token: 'D10',
    currency: 'USD'
  },
  {
    token: 'D25',
    currency: 'USD'
  },
  {
    token: 'D50',
    currency: 'USD'
  },
  {
    token: 'R25',
    currency: 'USD'
  },
  {
    token: 'R50',
    currency: 'USD'
  },
  {
    token: 'R100',
    currency: 'USD'
  },
  {
    token: 'S25',
    currency: 'USD'
  },
  {
    token: 'S50',
    currency: 'USD'
  },
  {
    token: 'S100',
    currency: 'USD'
  }
]

@Injectable()
export class SetupOracle extends PlaygroundSetup<OracleSetup> {
  oracleOwnerAddress: string = GenesisKeys[0].owner.address
  oracleIds: Record<string, string[]> = {}

  list (): OracleSetup[] {
    return [
      {
        address: this.oracleOwnerAddress,
        priceFeeds: STOCKS,
        options: {
          weightage: 1
        }
      },
      {
        address: this.oracleOwnerAddress,
        priceFeeds: STOCKS,
        options: {
          weightage: 1
        }
      },
      {
        address: this.oracleOwnerAddress,
        priceFeeds: STOCKS,
        options: {
          weightage: 1
        }
      },
      {
        address: this.oracleOwnerAddress,
        priceFeeds: BOTS,
        options: {
          weightage: 1
        }
      },
      {
        address: this.oracleOwnerAddress,
        priceFeeds: BOTS,
        options: {
          weightage: 1
        }
      },
      {
        address: this.oracleOwnerAddress,
        priceFeeds: BOTS,
        options: {
          weightage: 1
        }
      }
    ]
  }

  async create (each: OracleSetup): Promise<void> {
    await this.waitForBalance(101)
    const oracleId = await this.client.oracle.appointOracle(each.address, each.priceFeeds, each.options)

    for (const { token } of each.priceFeeds) {
      this.oracleIds[token] = [...(this.oracleIds[token] ?? []), oracleId]
    }

    await this.generate(1)
  }

  async has (each: OracleSetup): Promise<boolean> {
    try {
      return (await this.client.oracle.listOracles()).length >= this.list().length
    } catch (e) {
      return false
    }
  }
}
