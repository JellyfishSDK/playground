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

  // fund utxo
  await testing.container.call('sendtoaddress', [pocketAddr, 1])
  await testing.generate(1)
})

afterAll(async () => {
  await service.stop()
})

describe('add', () => {
  it('should add pool liquidity', async () => {
    const before: any = await client.rpc.call('getpoolpair', ['CAT-DFI'], 'number')
    const idBefore = Object.keys(before)[0]
    expect(before[idBefore].reserveA).toStrictEqual(250)
    expect(before[idBefore].reserveB).toStrictEqual(100)

    const res = await client.dex.add({
      fromAddress: pocketAddr,
      a: { id: 1, amount: 50 },
      b: { id: 0, amount: 10 },
      shareAddress: pocketAddr
    })
    console.log('res: ', res)

    const after: any = await client.rpc.call('getpoolpair', ['CAT-DFI'], 'number')
    const idAfter = Object.keys(after)[0]
    expect(before[idAfter].reserveA).toStrictEqual(300)
    expect(before[idAfter].reserveB).toStrictEqual(110)
  })
})
