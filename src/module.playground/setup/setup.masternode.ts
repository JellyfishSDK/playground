import { Injectable } from '@nestjs/common'
import { PlaygroundSetup } from '@src/module.playground/setup/setup'

interface MasternodeSetup {
  address: string
}

@Injectable()
export class SetupMasternode extends PlaygroundSetup<MasternodeSetup> {
  list (): MasternodeSetup[] {
    return [
      { address: 'bcrt1qf3dd6cxs9yqw4sjxnwp03k0twqlr7pcn3330h8' },
      { address: 'bcrt1qghljr8wvunlsktmf4nzcse8wj8ucx3sf4xzke2' }
    ]
  }

  async create (each: MasternodeSetup): Promise<void> {
    await this.waitForBalance(20001)
    await this.client.masternode.createMasternode(each.address)
    await this.generate(1)
  }

  async has (each: MasternodeSetup): Promise<boolean> {
    const nodes = await this.client.masternode.listMasternodes({ including_start: true, limit: 100 })
    return Object.values(nodes)
      .find(value => value.ownerAuthAddress === each.address) !== undefined
  }
}
