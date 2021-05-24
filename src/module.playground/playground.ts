import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { Injectable } from '@nestjs/common'

@Injectable()
export class Playground {
  static address = 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy'

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
