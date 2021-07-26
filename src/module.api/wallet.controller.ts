import BigNumber from 'bignumber.js'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { TokenDfiToAddress, WalletBalances } from '@playground-api-client/api/wallet'
import { PlaygroundSetup } from '@src/module.playground/setup/setup'
import {
  CTransaction,
  DeFiTransactionConstants,
  OP_CODES,
  Script,
  Transaction,
  Vin,
  Vout
} from '@defichain/jellyfish-transaction'
import { DeFiAddress } from '@defichain/jellyfish-address'
import { UTXO } from '@defichain/jellyfish-api-core/dist/category/wallet'

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

  /**
   * @deprecated
   */
  @Post('/tokens/dfi/sendtoaddress')
  async postDFIFallback (@Body() data: TokenDfiToAddress): Promise<string> {
    return await this.post(data)
  }

  @Post('/tokens/0/sendtoaddress')
  async post (@Body() data: TokenDfiToAddress): Promise<string> {
    const amount = new BigNumber(data.amount)
    const script = DeFiAddress.from('regtest', data.address).getScript()
    const utxos = await this.queryUnspent(amount)

    const transaction = this.createUtxoToAccountTransaction(amount, script, utxos)
    const hex = new CTransaction(transaction).toHex()
    const signed = await this.client.rawtx.signRawTransactionWithKey(hex, [PlaygroundSetup.privKey])
    const txId = await this.client.rawtx.sendRawTransaction(signed.hex, new BigNumber('100'))

    await this.waitConfirmation(txId)
    return txId
  }

  /**
   * Get unspent to spend and locks it.
   */
  async queryUnspent (amount: BigNumber): Promise<UTXO[]> {
    return await this.client.wallet.listUnspent(1, 9999999, {
      addresses: [PlaygroundSetup.address],
      includeUnsafe: false,
      queryOptions: {
        maximumCount: 100,
        minimumSumAmount: amount.plus(1).toNumber()
      }
    })
  }

  createUtxoToAccountTransaction (amount: BigNumber, script: Script, utxos: UTXO[]): Transaction {
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

    return {
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
  }

  async waitConfirmation (txId: string): Promise<void> {
    /* eslint-disable no-void */
    const expiredAt = Date.now() + 10000 // 10 seconds

    return await new Promise((resolve, reject) => {
      const checkCondition = async (): Promise<void> => {
        const { confirmations } = await this.client.rawtx.getRawTransaction(txId, true)
        if (confirmations > 0) {
          resolve()
        } else if (expiredAt < Date.now()) {
          reject(new Error('waitConfirmation timeout after 10 seconds'))
        } else {
          setTimeout(() => void checkCondition(), 500)
        }
      }

      void checkCondition()
    })
    /* eslint-enable no-void */
  }
}
