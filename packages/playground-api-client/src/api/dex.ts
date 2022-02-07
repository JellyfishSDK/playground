import { PlaygroundApiClient } from '../playground.api.client'

export class Dex {
  constructor (private readonly client: PlaygroundApiClient) {
  }

  /**
   * @param {AddPoolLiquidity} data
   * @param {string} data.fromAddress
   * @param {number} data.a.id
   * @param {number} data.a.number
   * @param {number} data.b.id
   * @param {number} data.b.number
   * @param {string} data.shareAddress
   * @return {Promise<string>} txid
   */
  async add (data: AddPoolLiquidity): Promise<string> {
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
