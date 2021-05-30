import { Controller, Get } from '@nestjs/common'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { StatsAll } from '@playground-api-client/api/stats'

@Controller('/v1/playground/stats')
export class StatsController {
  constructor (private readonly client: JsonRpcClient) {
  }

  @Get('/all')
  async all (): Promise<StatsAll> {
    const info = await this.client.blockchain.getBlockchainInfo()
    const balance = await this.client.wallet.getBalance()
    const account = await this.client.account.getTokenBalances({}, true, {
      symbolLookup: false
    })

    const tokens = Object.entries(account).map(([id, value]) => {
      return {
        id: id,
        balance: value.toNumber()
      }
    })

    return {
      block: {
        count: info.blocks,
        hash: info.bestblockhash
      },
      wallet: {
        balance: balance.toNumber()
      },
      account: {
        tokens: tokens
      }
    }
  }
}
