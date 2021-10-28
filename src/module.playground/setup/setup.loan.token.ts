import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { SetLoanToken } from '@defichain/jellyfish-api-core/dist/category/loan'
import BigNumber from 'bignumber.js'

@Injectable()
export class SetupLoanToken extends PlaygroundSetup<SetLoanToken> {
  list (): SetLoanToken[] {
    return [
      {
        symbol: 'TU10',
        fixedIntervalPriceId: 'TU10/USD',
        interest: new BigNumber('1.0')
      },
      {
        symbol: 'TD10',
        fixedIntervalPriceId: 'TD10/USD',
        interest: new BigNumber('1.5')
      },
      {
        symbol: 'TS25',
        fixedIntervalPriceId: 'TS25/USD',
        interest: new BigNumber('2.0')
      },
      {
        symbol: 'TR50',
        fixedIntervalPriceId: 'TR50/USD',
        interest: new BigNumber('3.0')
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
