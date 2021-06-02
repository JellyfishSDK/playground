import { PlaygroundApiClient } from '../playground.api.client'

export class Playground {
  constructor (private readonly client: PlaygroundApiClient) {
  }

  /**
   * @return {Promise<Info>} of playground
   */
  async info (): Promise<Info> {
    return await this.client.requestData('GET', 'info')
  }

  /**
   * @return {Promise<Wallet>} of playground
   */
  async wallet (): Promise<Wallet> {
    return await this.client.requestData('GET', 'wallet')
  }
}

export interface Info {
  block: {
    count: number
    hash: string
  }
}

export interface Wallet {
  balance: number
  tokens: Array<{ id: string, balance: number }>
}
