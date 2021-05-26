import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { Injectable } from '@nestjs/common'

@Injectable()
export abstract class PlaygroundSetup<Each> {
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
    return PlaygroundSetup.MN_KEY.operator.address
  }

  constructor (protected readonly client: JsonRpcClient) {
  }

  async setup (): Promise<void> {
    const list = this.list()
    await this.before(list)

    for (const each of list) {
      if (await this.has(each)) {
        continue
      }

      await this.create(each)
    }

    await this.after(list)
  }

  protected async before (list: Each[]): Promise<void> {
  }

  protected async after (list: Each[]): Promise<void> {
  }

  abstract list (): Each[]

  abstract has (each: Each): Promise<boolean>

  abstract create (each: Each): Promise<void>

  protected async generate (count: number): Promise<void> {
    let current = await this.client.blockchain.getBlockCount()
    const target = current + count
    while (current < target) {
      await this.client.call('generatetoaddress', [1, PlaygroundSetup.address, 1], 'number')
      current = await this.client.blockchain.getBlockCount()
    }
  }

  protected async waitForBalance (balance: number): Promise<void> {
    let current = await this.client.wallet.getBalance()
    while (current.lt(balance)) {
      await this.client.call('generatetoaddress', [1, PlaygroundSetup.address, 1], 'number')
      current = await this.client.wallet.getBalance()
    }
  }
}
