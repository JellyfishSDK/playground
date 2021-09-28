import { Injectable } from '@nestjs/common'
import { GenesisKeys } from '@defichain/testcontainers'
import { BigNumber } from '@defichain/jellyfish-json'
import { PlaygroundBot } from './bot'
import { SetupOracle } from '../setup/setup.oracle'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'

enum PriceDirection {
  UP, // Always going up
  DOWN, // Always going down
  RANDOM, // Randomly goes up or down (minimum $1)
  STABLE // Fixed value
}

type PriceDirectionFunction = (price: BigNumber, priceChange: BigNumber) => BigNumber

const PriceDirectionFunctions: Record<PriceDirection, PriceDirectionFunction> = {
  [PriceDirection.UP]: (price: BigNumber, priceChange: BigNumber) => {
    return price.plus(priceChange)
  },
  [PriceDirection.DOWN]: (price: BigNumber, priceChange: BigNumber) => {
    return price.minus(priceChange)
  },
  [PriceDirection.RANDOM]: (price: BigNumber, priceChange: BigNumber) => {
    return BigNumber.random().gt(0.5)
      ? price.plus(priceChange)
      : BigNumber.max(price.minus(priceChange), 1)
  },
  [PriceDirection.STABLE]: (price: BigNumber, priceChange: BigNumber) => {
    return price
  }
}

interface SimulatedOracleFeed {
  token: string
  startingPrice: BigNumber
  priceChange: BigNumber
  timeInterval: number
  priceDirection: PriceDirection
}

@Injectable()
export class OracleBot extends PlaygroundBot<SimulatedOracleFeed> {
  oracleOwnerAddress: string = GenesisKeys[7].operator.address

  constructor (
    protected readonly client: JsonRpcClient,
    protected readonly setupOracle: SetupOracle) {
    super(client)
  }

  list (): SimulatedOracleFeed[] {
    return [
      {
        token: 'U25',
        startingPrice: new BigNumber(100),
        priceChange: new BigNumber(25),
        timeInterval: 15000,
        priceDirection: PriceDirection.UP
      },
      {
        token: 'U50',
        startingPrice: new BigNumber(100),
        priceChange: new BigNumber(50),
        timeInterval: 15000,
        priceDirection: PriceDirection.UP
      },
      {
        token: 'U100',
        startingPrice: new BigNumber(100),
        priceChange: new BigNumber(50),
        timeInterval: 15000,
        priceDirection: PriceDirection.UP
      },
      {
        token: 'D25',
        startingPrice: new BigNumber(10000000),
        priceChange: new BigNumber(25),
        timeInterval: 15000,
        priceDirection: PriceDirection.DOWN
      },
      {
        token: 'D50',
        startingPrice: new BigNumber(10000000),
        priceChange: new BigNumber(50),
        timeInterval: 15000,
        priceDirection: PriceDirection.DOWN
      },
      {
        token: 'D100',
        startingPrice: new BigNumber(10000000),
        priceChange: new BigNumber(50),
        timeInterval: 15000,
        priceDirection: PriceDirection.DOWN
      },
      {
        token: 'S25',
        startingPrice: new BigNumber(25),
        priceChange: new BigNumber(0),
        timeInterval: 15000,
        priceDirection: PriceDirection.STABLE
      },
      {
        token: 'S50',
        startingPrice: new BigNumber(50),
        priceChange: new BigNumber(0),
        timeInterval: 15000,
        priceDirection: PriceDirection.STABLE
      },
      {
        token: 'S100',
        startingPrice: new BigNumber(100),
        priceChange: new BigNumber(0),
        timeInterval: 15000,
        priceDirection: PriceDirection.STABLE
      },
      {
        token: 'R25',
        startingPrice: new BigNumber(5000),
        priceChange: new BigNumber(25),
        timeInterval: 15000,
        priceDirection: PriceDirection.RANDOM
      },
      {
        token: 'R50',
        startingPrice: new BigNumber(5000),
        priceChange: new BigNumber(50),
        timeInterval: 15000,
        priceDirection: PriceDirection.RANDOM
      },
      {
        token: 'R100',
        startingPrice: new BigNumber(5000),
        priceChange: new BigNumber(100),
        timeInterval: 15000,
        priceDirection: PriceDirection.RANDOM
      }
    ]
  }

  private async sendInitial (oracleId: string, medianTime: number, price: BigNumber): Promise<void> {
    await this.client.oracle.setOracleData(oracleId, medianTime, {
      prices: [
        {
          tokenAmount: price.toFixed(8),
          currency: 'USD'
        }
      ]
    })
  }

  async run (each: SimulatedOracleFeed): Promise<void> {
    const oracleIds = this.setupOracle.oracleIds[each.token]
    const blockchainInfo = await this.client.blockchain.getBlockchainInfo()
    const medianTime = blockchainInfo.mediantime
    for (const oracleId of oracleIds) {
      const oracleData = await this.client.oracle.getOracleData(oracleId)
      const tokenPrice = oracleData.tokenPrices.find(x => x.token === each.token)

      if (tokenPrice === undefined) {
        await this.sendInitial(oracleId, medianTime, each.startingPrice)
        continue
      }

      if (medianTime - tokenPrice.timestamp < (each.timeInterval / 1000)) {
        continue
      }

      const price = new BigNumber(tokenPrice.amount)
      const priceFunction = PriceDirectionFunctions[each.priceDirection]
      const newPrice = priceFunction(price, each.priceChange)

      await this.client.oracle.setOracleData(oracleId, medianTime, {
        prices: [
          {
            tokenAmount: newPrice.toFixed(8),
            currency: 'USD'
          }
        ]
      })
    }
  }
}
