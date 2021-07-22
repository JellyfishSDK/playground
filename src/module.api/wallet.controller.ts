import BigNumber from 'bignumber.js'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { TokenDfiToAddress, WalletBalances } from '@playground-api-client/api/wallet'
import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import {
  CTransaction,
  DeFiTransactionConstants,
  OP_CODES,
  Transaction,
  Vin,
  Vout
} from '@defichain/jellyfish-transaction'
import { DeFiAddress } from '@defichain/jellyfish-address'

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

  @Post('/tokens/dfi/sendtoaddress')
  async post (@Body() data: TokenDfiToAddress): Promise<string> {
    const amount = new BigNumber(data.amount)
    const script = DeFiAddress.from('regtest', data.address).getScript()

    const utxos = await this.client.wallet.listUnspent(1, 9999999, {
      addresses: [PlaygroundSetup.address],
      queryOptions: {
        maximumCount: 100,
        minimumSumAmount: amount.plus(1).toNumber()
      }
    })

    const utxoToAccount: Vout = {
      value: amount,
      script: {
        stack: [
          OP_CODES.OP_RETURN,
          OP_CODES.OP_DEFI_TX_UTXOS_TO_ACCOUNT({
            to: [{
              script: script,
              balances: [{ token: 0, amount: amount }]
            }]
          })
        ]
      },
      tokenId: 0x00
    }

    const sum = utxos.reduce((acc, b) => acc.plus(b.amount), new BigNumber(0))
    const change: Vout = {
      value: sum.minus(amount).minus(0.00010000), // fixed fee
      script: DeFiAddress.from('regtest', PlaygroundSetup.address).getScript(),
      tokenId: 0x00
    }

    const transaction: Transaction = {
      version: DeFiTransactionConstants.Version,
      vin: utxos.map((utxo): Vin => ({
        index: utxo.vout,
        script: DeFiAddress.from('regtest', utxo.address).getScript(),
        sequence: 0xffffffff,
        txid: utxo.txid
      })),
      vout: [
        utxoToAccount,
        change
      ],
      lockTime: 0x00000000
    }

    const hex = new CTransaction(transaction).toHex()
    const signed = await this.client.rawtx.signRawTransactionWithKey(hex, [PlaygroundSetup.privKey])
    return await this.client.rawtx.sendRawTransaction(signed.hex, new BigNumber('100'))
  }
}
