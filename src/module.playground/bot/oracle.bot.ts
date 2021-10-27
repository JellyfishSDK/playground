import { Injectable } from '@nestjs/common'
import { BigNumber } from '@defichain/jellyfish-json'
import { PlaygroundBot } from './bot'
import { SetupOracle } from '../setup/setup.oracle'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'

/**
 * The following symbols are automated by this bot:
 * - U10: Goes up every 15 seconds by 10%
 * - U25: Goes up every 15 seconds by 25%
 * - U50: Goes up every 15 seconds by 50%
 * - D10: Goes down every 15 seconds by 10%
 * - D25: Goes down every 15 seconds by 25%
 * - D50: Goes down every 15 seconds by 50%
 * - S25: Is always $25
 * - S50: Is always $50
 * - S100: Is always $100
 * - R25: Goes down every 15 seconds by $25
 * - R50: Goes down every 15 seconds by $50
 * - R100: Goes down every 15 seconds by $100
 */
enum PriceDirection {
  UP_ABSOLUTE, // Always going up (absolute value)
  DOWN_ABSOLUTE, // Always going down (absolute value)
  UP_PERCENTAGE, // Always going up (percentage value)
  DOWN_PERCENTAGE, // Always going down (percentage value)
  RANDOM, // Randomly goes up or down (minimum $1)
  STABLE // Fixed value
}

type PriceDirectionFunction = (price: BigNumber, priceChange: BigNumber) => BigNumber

const PriceDirectionFunctions: Record<PriceDirection, PriceDirectionFunction> = {
  [PriceDirection.UP_ABSOLUTE]: (price: BigNumber, priceChange: BigNumber) => {
    return price.plus(priceChange)
  },
  [PriceDirection.DOWN_ABSOLUTE]: (price: BigNumber, priceChange: BigNumber) => {
    return price.minus(priceChange)
  },
  [PriceDirection.UP_PERCENTAGE]: (price: BigNumber, priceChange: BigNumber) => {
    return price.plus(price.times(priceChange.dividedBy(100)))
  },
  [PriceDirection.DOWN_PERCENTAGE]: (price: BigNumber, priceChange: BigNumber) => {
    return price.minus(price.times(priceChange.dividedBy(100)))
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
  constructor (
    protected readonly client: JsonRpcClient,
    protected readonly setupOracle: SetupOracle) {
    super(client)
  }

  list (): SimulatedOracleFeed[] {
    return [
      {
        token: 'U10',
        startingPrice: new BigNumber(10),
        priceChange: new BigNumber(10),
        timeInterval: 15000,
        priceDirection: PriceDirection.UP_PERCENTAGE
      },
      {
        token: 'U25',
        startingPrice: new BigNumber(10),
        priceChange: new BigNumber(25),
        timeInterval: 15000,
        priceDirection: PriceDirection.UP_PERCENTAGE
      },
      {
        token: 'U50',
        startingPrice: new BigNumber(10),
        priceChange: new BigNumber(50),
        timeInterval: 15000,
        priceDirection: PriceDirection.UP_PERCENTAGE
      },
      {
        token: 'D10',
        startingPrice: new BigNumber(10000000),
        priceChange: new BigNumber(10),
        timeInterval: 15000,
        priceDirection: PriceDirection.DOWN_PERCENTAGE
      },
      {
        token: 'D25',
        startingPrice: new BigNumber(10000000),
        priceChange: new BigNumber(25),
        timeInterval: 15000,
        priceDirection: PriceDirection.DOWN_PERCENTAGE
      },
      {
        token: 'D50',
        startingPrice: new BigNumber(10000000),
        priceChange: new BigNumber(50),
        timeInterval: 15000,
        priceDirection: PriceDirection.DOWN_PERCENTAGE
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

  private async sendInitial (oracleId: string, medianTime: number, each: SimulatedOracleFeed): Promise<void> {
    await this.client.oracle.setOracleData(oracleId, medianTime, {
      prices: [
        {
          tokenAmount: `${each.startingPrice.toFixed(8)}@${each.token}`,
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
        await this.sendInitial(oracleId, medianTime, each)
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
            tokenAmount: `${newPrice.toFixed(8)}@${each.token}`,
            currency: 'USD'
          }
        ]
      })
    }
  }

  async has (each: SimulatedOracleFeed): Promise<boolean> {
    const oracleIds = this.setupOracle.oracleIds[each.token]
    return oracleIds !== undefined
  }
}
