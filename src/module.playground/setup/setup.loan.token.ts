import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { SetLoanToken } from '@defichain/jellyfish-api-core/dist/category/loan'
import BigNumber from 'bignumber.js'

@Injectable()
export class SetupLoanToken extends PlaygroundSetup<SetLoanToken> {
  list (): SetLoanToken[] {
    return [
      {
        symbol: 'U10',
        fixedIntervalPriceId: 'U10/USD',
        interest: new BigNumber('1.0')
      },
      {
        symbol: 'U25',
        fixedIntervalPriceId: 'U25/USD',
        interest: new BigNumber('1.5')
      },
      {
        symbol: 'U50',
        fixedIntervalPriceId: 'U50/USD',
        interest: new BigNumber('2.0')
      },
      {
        symbol: 'D10',
        fixedIntervalPriceId: 'D10/USD',
        interest: new BigNumber('1.0')
      },
      {
        symbol: 'D25',
        fixedIntervalPriceId: 'D25/USD',
        interest: new BigNumber('1.5')
      },
      {
        symbol: 'D50',
        fixedIntervalPriceId: 'D50/USD',
        interest: new BigNumber('2.0')
      },
      {
        symbol: 'S25',
        fixedIntervalPriceId: 'S25/USD',
        interest: new BigNumber('1.0')
      },
      {
        symbol: 'S50',
        fixedIntervalPriceId: 'S50/USD',
        interest: new BigNumber('1.5')
      },
      {
        symbol: 'S100',
        fixedIntervalPriceId: 'S100/USD',
        interest: new BigNumber('2.0')
      },
      {
        symbol: 'R25',
        fixedIntervalPriceId: 'R25/USD',
        interest: new BigNumber('1.0')
      },
      {
        symbol: 'R50',
        fixedIntervalPriceId: 'R50/USD',
        interest: new BigNumber('1.5')
      },
      {
        symbol: 'R100',
        fixedIntervalPriceId: 'R100/USD',
        interest: new BigNumber('2.0')
      }
    ]
  }

  async create (each: SetLoanToken): Promise<void> {
    await this.client.loan.setLoanToken(each)
    await this.generate(1)
  }

  async has (each: SetLoanToken): Promise<boolean> {
    try {
      await this.client.loan.getLoanToken(each.symbol)
      return true
    } catch (e) {
      return false
    }
  }
}
