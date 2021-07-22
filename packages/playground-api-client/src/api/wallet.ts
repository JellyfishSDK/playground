import { PlaygroundApiClient } from '../playground.api.client'

export class Wallet {
  constructor (private readonly client: PlaygroundApiClient) {
  }

  /**
   * @return {Promise<WalletBalances>} of playground
   */
  async balances (): Promise<WalletBalances> {
    return await this.client.requestData('GET', 'wallet/balances')
  }
}

export interface WalletBalances {
  balance: number
  tokens: Array<{ id: string, balance: number }>
}
