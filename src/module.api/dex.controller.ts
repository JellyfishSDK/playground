import { DecodedAddress, fromAddress } from '@defichain/jellyfish-address'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { CTransactionSegWit, DeFiTransactionConstants, OP_CODES, Transaction, TransactionSegWit, Vout, Vin } from '@defichain/jellyfish-transaction'
import { Body, Controller, Post } from '@nestjs/common'
import BigNumber from 'bignumber.js'
import { waitForCondition } from '@defichain/testcontainers/dist/utils'
import { AddPoolLiquidity } from '@playground-api-client/api/dex'
import { SignInputOption, TransactionSigner } from '@defichain/jellyfish-transaction-signature'
import { UTXO } from '@defichain/jellyfish-api-core/dist/category/wallet'
import { HASH160, WIF } from '@defichain/jellyfish-crypto'
import { Prevout } from '@defichain/jellyfish-transaction-builder/dist'

@Controller('/v0/playground/dex')
export class DexController {
  constructor (private readonly client: JsonRpcClient) {
  }

  @Post('/add')
  async add (@Body() data: AddPoolLiquidity): Promise<string> {
    const utxo = await this.getUtxo(data.fromAddress)
    if (utxo === undefined) {
      throw new Error('utxo not found')
    }
    const defiTx = createAddPoolLiqTx(data, utxo)

    const privKey: string = await this.client.call('dumpprivkey', [data.fromAddress], 'number')
    const keyPair = WIF.asEllipticPair(privKey)
    const prevout = mapPrevout(utxo, await keyPair.publicKey())

    const inputOpt: SignInputOption = {
      prevout: prevout,
      publicKey: async () => await keyPair.publicKey(),
      sign: async (hash: Buffer) => await keyPair.sign(hash)
    }

    const tx: TransactionSegWit = await TransactionSigner.sign(defiTx, [inputOpt])
    console.log('tx: ', tx)
    const hex = new CTransactionSegWit(tx).toHex()

    const fundOptions = { lockUnspents: true, changePosition: 1 }
    const { hex: funded } = await this.client.call('fundrawtransaction', [hex, fundOptions], 'number')
    const { hex: signed } = await this.client.call('signrawtransactionwithwallet', [funded], 'number')
    const txid = await this.client.rawtx.sendRawTransaction(signed)
    console.log('txid: ', txid)
    await this.waitConfirmation(txid)
    return txid
  }

  async getUtxo (addr: string): Promise<UTXO | undefined> {
    const utxos: UTXO[] = await this.client.wallet.listUnspent(
      1, 9999999, { addresses: [addr], includeUnsafe: true }
    )
    console.log('utxos: ', utxos, utxos.length, utxos[utxos.length - 1].amount.toNumber())
    return utxos.find(utxo => utxo.amount.gte(0.001))
  }

  async waitConfirmation (txid: string, timeout: number = 30000): Promise<void> {
    await waitForCondition(async () => {
      const txn = await this.client.rawtx.getRawTransaction(txid, true)
      return txn.confirmations > 0
    }, timeout, 500)
  }
}

function mapPrevout (utxo: UTXO, pubKey: Buffer): Prevout {
  return {
    txid: utxo.txid,
    vout: utxo.vout,
    value: new BigNumber(utxo.amount),
    script: {
      stack: [
        OP_CODES.OP_0,
        OP_CODES.OP_PUSHDATA(HASH160(pubKey), 'little')
      ]
    },
    tokenId: utxo.tokenId
  }
}

function createAddPoolLiqTx (data: AddPoolLiquidity, utxo: UTXO): Transaction {
  const decodedFromAddr = fromAddress(data.fromAddress, 'regtest') as DecodedAddress
  const decodedShareAddr = fromAddress(data.shareAddress, 'regtest') as DecodedAddress

  const addPoolLiquidity: Vout = {
    value: new BigNumber(0.001),
    script: {
      stack: [
        OP_CODES.OP_RETURN,
        OP_CODES.OP_DEFI_TX_POOL_ADD_LIQUIDITY({
          from: [{
            script: decodedFromAddr.script,
            balances: [{
              token: data.a.id,
              amount: new BigNumber(data.a.amount)
            }, {
              token: data.b.id,
              amount: new BigNumber(data.b.amount)
            }]
          }],
          shareAddress: decodedShareAddr.script
        })
      ]
    },
    tokenId: 0x00
  }

  const input: Vin = {
    txid: utxo.txid,
    index: utxo.vout,
    script: { stack: [] },
    sequence: 0xffffffff
  }

  return {
    version: DeFiTransactionConstants.Version,
    vin: [input],
    vout: [addPoolLiquidity],
    lockTime: 0x00000000
  }
}
