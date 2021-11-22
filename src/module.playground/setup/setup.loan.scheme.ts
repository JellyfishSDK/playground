import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import { Injectable } from '@nestjs/common'
import { CreateLoanScheme } from '@defichain/jellyfish-api-core/dist/category/loan'
import BigNumber from 'bignumber.js'

@Injectable()
export class SetupLoanScheme extends PlaygroundSetup<CreateLoanScheme> {
  list (): CreateLoanScheme[] {
    return [
      {
        id: '1',
        interestRate: new BigNumber('5'),
        minColRatio: 150
      },
      {
        id: '2',
        interestRate: new BigNumber('3'),
        minColRatio: 175
      },
      {
        id: '3',
        interestRate: new BigNumber('2'),
        minColRatio: 200
      },
      {
        id: '4',
        interestRate: new BigNumber('1.5'),
        minColRatio: 350
      },
      {
        id: '5',
        interestRate: new BigNumber('1'),
        minColRatio: 500
      },
      {
        id: '6',
        interestRate: new BigNumber('0.5'),
        minColRatio: 1000
      }
    ]
  }

  async create (each: CreateLoanScheme): Promise<void> {
    await this.client.loan.createLoanScheme(each)
  }

  async has (each: CreateLoanScheme): Promise<boolean> {
    try {
      await this.client.loan.getLoanScheme(each.id)
      return true
    } catch (e) {
      return false
    }
  }
}
