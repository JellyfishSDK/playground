import { PlaygroundApiClient } from '../playground.api.client'

export class Dex {
  constructor (private readonly client: PlaygroundApiClient) {
  }

  /**
   * @return {Promise<WalletBalances>} of playground
   */
  async add (data: AddPoolLiquidity): Promise<any> {
    return await this.client.requestData('POST', 'dex/add', data)
  }
}

export interface AddPoolLiquidity {
  fromAddress: string
  a: {
    id: number
    amount: number
  }
  b: {
    id: number
    amount: number
  }
  shareAddress: string
}
