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

  /**
   * @return {Promise<WalletBalances>} of playground
   */
  async sendTokenDfiToAddress (data: TokenDfiToAddress): Promise<string> {
    return await this.client.requestData('POST', 'wallet/tokens/dfi/sendtoaddress', data)
  }
}

export interface WalletBalances {
  balance: number
  tokens: Array<{ id: string, balance: number }>
}

export interface TokenDfiToAddress {
  amount: string
  address: string
}
