import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { Injectable } from '@nestjs/common'

@Injectable()
export class Playground {
  static MN_KEY = {
    owner: {
      address: 'mwsZw8nF7pKxWH8eoKL9tPxTpaFkz7QeLU',
      privKey: 'cRiRQ9cHmy5evDqNDdEV8f6zfbK6epi9Fpz4CRZsmLEmkwy54dWz'
    },
    operator: {
      address: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      privKey: 'cPGEaz8AGiM71NGMRybbCqFNRcuUhg3uGvyY4TFE1BZC26EW2PkC'
    }
  }

  static get address (): string {
    return Playground.MN_KEY.operator.address
  }

  constructor (protected readonly client: JsonRpcClient) {
  }

  protected async generate (count: number): Promise<void> {
    let current = await this.client.blockchain.getBlockCount()
    const target = current + count
    while (current < target) {
      await this.client.call('generatetoaddress', [1, Playground.address, 1], 'number')
      current = await this.client.blockchain.getBlockCount()
    }
  }

  protected async waitForBalance (balance: number): Promise<void> {
    let current = await this.client.wallet.getBalance()
    while (current.lt(balance)) {
      await this.client.call('generatetoaddress', [1, Playground.address, 1], 'number')
      current = await this.client.wallet.getBalance()
    }
  }
}
