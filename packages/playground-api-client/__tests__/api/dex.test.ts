import { StubPlaygroundApiClient } from '../stub.client'
import { StubService } from '../stub.service'
import { Testing } from '@defichain/jellyfish-testing'

const service = new StubService()
const testing = Testing.create(service.container)
const client = new StubPlaygroundApiClient(service)
let pocketAddr: string

beforeAll(async () => {
  await service.start()
  await service.container.waitForWalletCoinbaseMaturity()

  pocketAddr = await testing.generateAddress()

  await testing.token.dfi({ amount: 5000, address: pocketAddr })
  await testing.generate(1)

  // fund utxo
  for (let i = 0; i < 2; i += 1) {
    await testing.container.call('sendtoaddress', [pocketAddr, 1])
    await testing.generate(1)
  }

  await testing.token.create({ symbol: 'CAT', collateralAddress: pocketAddr })
  await testing.generate(1)

  await testing.token.mint({ symbol: 'CAT', amount: 3000 })
  await testing.generate(1)

  await testing.poolpair.create({ tokenA: 'CAT', tokenB: 'DFI' })
  await testing.generate(1)

  await testing.poolpair.add({
    a: { symbol: 'CAT', amount: 250 },
    b: { symbol: 'DFI', amount: 100 },
    address: pocketAddr
  })
  await testing.generate(1)
})

afterAll(async () => {
  await service.stop()
})

describe('add', () => {
  it('should add pool liquidity', async () => {
    const before = await client.rpc.call('getpoolpair', ['CAT-DFI'], 'number')
    console.log('before: ', before)

    try {
      await client.dex.add({
        fromAddress: pocketAddr,
        a: { id: 1, amount: 50 },
        b: { id: 0, amount: 10 },
        shareAddress: pocketAddr
      })

      const after = await client.rpc.call('getpoolpair', ['CAT-DFI'], 'number')
      console.log('after: ', after)
    } catch (err) {
      console.log('err: ', err)
    }
  })
})
