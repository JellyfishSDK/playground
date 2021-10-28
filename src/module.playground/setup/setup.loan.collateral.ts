import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { SetCollateralToken } from '@defichain/jellyfish-api-core/dist/category/loan'
import BigNumber from 'bignumber.js'

@Injectable()
export class SetupLoanCollateral extends PlaygroundSetup<SetCollateralToken> {
  list (): SetCollateralToken[] {
    return [
      {
        token: 'DFI',
        fixedIntervalPriceId: 'DFI/USD',
        factor: new BigNumber('0.5')
      },
      {
        token: 'BTC',
        fixedIntervalPriceId: 'BTC/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'ETH',
        fixedIntervalPriceId: 'ETH/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'USDC',
        fixedIntervalPriceId: 'USDC/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'USDT',
        fixedIntervalPriceId: 'USDT/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'U10',
        fixedIntervalPriceId: 'U25/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'U25',
        fixedIntervalPriceId: 'U25/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'U50',
        fixedIntervalPriceId: 'U50/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'D10',
        fixedIntervalPriceId: 'D10/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'D25',
        fixedIntervalPriceId: 'D25/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'D50',
        fixedIntervalPriceId: 'D50/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'S25',
        fixedIntervalPriceId: 'S25/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'S50',
        fixedIntervalPriceId: 'S50/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'S100',
        fixedIntervalPriceId: 'S100/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'R25',
        fixedIntervalPriceId: 'R25/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'R50',
        fixedIntervalPriceId: 'R50/USD',
        factor: new BigNumber('0')
      },
      {
        token: 'R100',
        fixedIntervalPriceId: 'R100/USD',
        factor: new BigNumber('0')
      }
    ]
  }

  async create (each: SetCollateralToken): Promise<void> {
    await this.client.loan.setCollateralToken(each)
    await this.generate(1)
  }

  async has (each: SetCollateralToken): Promise<boolean> {
    try {
      await this.client.loan.getCollateralToken(each.token)
      return true
    } catch (e) {
      return false
    }
  }
}
