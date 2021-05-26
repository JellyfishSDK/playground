import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { Injectable, Logger } from '@nestjs/common'

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

  /**
   * @return {string} address that should be used for everything
   */
  static get address (): string {
    return PlaygroundSetup.MN_KEY.operator.address
  }

  private readonly logger = new Logger(PlaygroundSetup.name)

  constructor (protected readonly client: JsonRpcClient) {
  }

  /**
   * Run the setup process
   */
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

  /**
   * Before creating each, optionally execute something
   */
  protected async before (list: Each[]): Promise<void> {
  }

  /**
   * After creating each, optionally execute something
   */
  protected async after (list: Each[]): Promise<void> {
  }

  /**
   * @return {Each[]} to setup
   */
  abstract list (): Each[]

  /**
   * @param {Each} each to check if it already exist so that it won't be setup again.
   */
  abstract has (each: Each): Promise<boolean>

  /**
   * @param {Each} each to create
   */
  abstract create (each: Each): Promise<void>

  /**
   * @param {number} count of blocks to generate
   */
  protected async generate (count: number): Promise<void> {
    let current = await this.client.blockchain.getBlockCount()
    const target = current + count
    while (current < target) {
      this.logger.log(`current block: ${current}, generate +${count} block`)
      await this.client.call('generatetoaddress', [1, PlaygroundSetup.address, 1], 'number')
      current = await this.client.blockchain.getBlockCount()
    }
  }

  /**
   * @param {number} balance to wait for wallet to reach
   */
  protected async waitForBalance (balance: number): Promise<void> {
    let current = await this.client.wallet.getBalance()
    while (current.lt(balance)) {
      this.logger.log(`current balance: ${current.toFixed(8)}, generate to balance: ${balance}`)
      await this.client.call('generatetoaddress', [1, PlaygroundSetup.address, 1], 'number')
      current = await this.client.wallet.getBalance()
    }
  }
}
