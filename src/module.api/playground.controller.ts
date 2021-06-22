import { Controller, Get } from '@nestjs/common'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { Info, Wallet } from '@playground-api-client/api/playground'

@Controller('/v0/playground')
export class PlaygroundController {
  constructor (private readonly client: JsonRpcClient) {
  }

  @Get('/info')
  async info (): Promise<Info> {
    const info = await this.client.blockchain.getBlockchainInfo()
    return {
      block: {
        count: info.blocks,
        hash: info.bestblockhash
      }
    }
  }

  @Get('/wallet')
  async wallet (): Promise<Wallet> {
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
      balance: balance.toNumber(),
      tokens: tokens
    }
  }
}
