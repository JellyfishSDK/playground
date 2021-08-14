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
   * @deprecated use sendToken instead
   */
  async sendTokenDfiToAddress (data: SendToken): Promise<string> {
    return await this.sendToken('0', data.amount, data.address)
  }

  /**
   * Send token to address, this method will wait for confirmation.
   *
   * @param {string} tokenId to send to address
   * @param {string} amount to send to address
   * @param {string} address to send to
   * @return {string} txid
   */
  async sendToken (tokenId: string, amount: string, address: string): Promise<string> {
    const data: SendToken = { amount, address }
    return await this.client.requestData('POST', `wallet/tokens/${tokenId}/send`, data)
  }
}

export interface WalletBalances {
  balance: number
  tokens: Array<{ id: string, balance: number }>
}

export interface SendToken {
  amount: string
  address: string
}
