import { PlaygroundApiClient } from '../playground.api.client'

export class Stats {
  constructor (private readonly client: PlaygroundApiClient) {
  }

  /**
   * @return {Promise<StatsAll>} of playground
   */
  async all (): Promise<StatsAll> {
    return await this.client.requestData('GET', 'stats/all')
  }
}

export interface StatsAll {
  block: StatsBlock
  wallet: StatsWallet
  account: StatsAccount
}

export interface StatsBlock {
  count: number
  hash: string
}

export interface StatsWallet {
  balance: number
}

export interface StatsAccount {
  tokens: Array<{ id: string, balance: number }>
}
