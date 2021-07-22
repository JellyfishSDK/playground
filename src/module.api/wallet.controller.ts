import { Controller, Get } from '@nestjs/common'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { WalletBalances } from '@playground-api-client/api/wallet'

@Controller('/v0/playground/wallet')
export class WalletController {
  constructor (private readonly client: JsonRpcClient) {
  }

  @Get('/balances')
  async balances (): Promise<WalletBalances> {
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
