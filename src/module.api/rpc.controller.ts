import {
  Controller,
  Param,
  Post,
  Body,
  ForbiddenException,
  HttpCode,
  PipeTransform,
  Injectable,
  ArgumentMetadata
} from '@nestjs/common'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'

/**
 * MethodWhitelist is a whitelist validation pipe to check whether a plain old rpc can be
 * routed through playground. Non whitelisted method call will result in a ForbiddenException.
 *
 * Direct access to DeFiD should not be allowed, that could used used as an attack against
 * DeFi playground services. (e.g. by changing our peers)
 */
@Injectable()
export class MethodWhitelist implements PipeTransform {
  static methods = [
    'getblockchaininfo',
    'getchaintxstats',
    'getblockstats',
    'getbestblockhash',
    'getblockcount',
    'getblock',
    'getblockhash',
    'getblockheader',
    'getchaintips',
    'getdifficulty',
    'getrawmempool',
    'gettxout',
    'gettxoutsetinfo',
    'getnetworkhashps',
    'getmintinginfo',
    'getmininginfo',
    'generatetoaddress',
    'estimatesmartfee',
    'validateaddress',
    'deriveaddresses',
    'verifymessage',
    'getconnectioncount',
    'getnetworkinfo',
    'getnodeaddresses',
    'getrawtransaction',
    'createrawtransaction',
    'decoderawtransaction',
    'decodescript',
    'sendrawtransaction',
    'combinerawtransaction',
    'testmempoolaccept',
    'fundrawtransaction',
    'createwallet',
    'getaddressinfo',
    'getbalance',
    'getnewaddress',
    'getrawchangeaddress',
    'getreceivedbyaddress',
    'getreceivedbylabel',
    'gettransaction',
    'getunconfirmedbalance',
    'getbalances',
    'getwalletinfo',
    'importaddress',
    'listaddressgroupings',
    'listlabels',
    'listlockunspent',
    'listreceivedbyaddress',
    'listreceivedbylabel',
    'listsinceblock',
    'listtransactions',
    'listunspent',
    'listwallets',
    'sendmany',
    'sendtoaddress',
    'signmessage',
    'signrawtransactionwithwallet',
    'isappliedcustomtx',
    'listaccounts',
    'getaccount',
    'gettokenbalances',
    'utxostoaccount',
    'accounttoaccount',
    'accounttoutxos',
    'listaccounthistory',
    'accounthistorycount',
    'listcommunitybalances',
    'sendtokenstoaddress',
    'listpoolpairs',
    'getpoolpair',
    'addpoolliquidity',
    'removepoolliquidity',
    'createpoolpair',
    'updatepoolpair',
    'poolswap',
    'listpoolshares',
    'testpoolswap',
    'createtoken',
    'updatetoken',
    'listtokens',
    'gettoken',
    'getcustomtx',
    'minttokens'
  ]

  transform (value: string, metadata: ArgumentMetadata): string {
    if (!MethodWhitelist.methods.includes(value)) {
      throw new ForbiddenException('RPC method not whitelisted')
    }
    return value
  }
}

export class CallRequest {
  params?: any[]
}

@Controller('/v0/playground/rpc')
export class RpcController {
  constructor (private readonly client: JsonRpcClient) {
  }

  @Post('/:method')
  @HttpCode(200)
  async call (@Param('method', MethodWhitelist) method: string, @Body() call?: CallRequest): Promise<any> {
    return await this.client.call(method, call?.params ?? [], 'lossless')
  }
}
