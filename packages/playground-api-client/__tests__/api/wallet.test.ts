import { MasterNodeRegTestContainer } from '@defichain/testcontainers'
import { PlaygroundApiClient } from '../../src'
import { StubPlaygroundApiClient } from '../stub.client'
import { StubService } from '../stub.service'
import { Bech32, Elliptic } from '@defichain/jellyfish-crypto'
import waitForExpect from 'wait-for-expect'

let container: MasterNodeRegTestContainer
let service: StubService
let client: PlaygroundApiClient

beforeAll(async () => {
  container = new MasterNodeRegTestContainer()
  service = new StubService(container)
  client = new StubPlaygroundApiClient(service)

  await container.start()
  await container.waitForReady()
  await container.waitForWalletCoinbaseMaturity()
  await service.start()
})

afterAll(async () => {
  try {
    await service.stop()
  } finally {
    await container.stop()
  }
})

it('should get wallet', async () => {
  const wallet = await client.wallet.balances()

  expect(wallet).toStrictEqual({
    balance: expect.any(Number),
    tokens: [
      { id: '1', balance: expect.any(Number) },
      { id: '2', balance: expect.any(Number) },
      { id: '3', balance: expect.any(Number) },
      { id: '4', balance: expect.any(Number) },
      { id: '5', balance: expect.any(Number) },
      { id: '6', balance: expect.any(Number) },
      { id: '7', balance: expect.any(Number) },
      { id: '8', balance: expect.any(Number) },
      { id: '9', balance: expect.any(Number) },
      { id: '10', balance: expect.any(Number) }
    ]
  })
})

describe('tokens', () => {
  it('should send token 0 to address and wait for automated block confirmation', async () => {
    const address = 'bcrt1qkt7rvkzk8qs7rk54vghrtzcdxfqazscmmp30hk'

    const txid = await client.wallet.sendToken('0', '15.99134567', address)
    expect(txid.length).toStrictEqual(64)

    await waitForExpect(async () => {
      const balances = await container.call('getaccount', [address])
      expect(balances).toStrictEqual(['15.99134567@DFI'])
    })
  })

  it('should send token 1 to address and wait for confirmation', async () => {
    const address = 'bcrt1qur2tmednr6e52u9du972nqvua60egwqkf98ps8'
    const txid = await client.wallet.sendToken('1', '1.2343134', address)
    expect(txid.length).toStrictEqual(64)

    await waitForExpect(async () => {
      const balances = await container.call('getaccount', [address])
      expect(balances).toStrictEqual(['1.23431340@BTC'])
    })
  })

  it('should keep sending 10.00000000@DFI to address x30 times', async () => {
    const promises = [...Array(30).keys()].map(async () => {
      const pair = Elliptic.fromPrivKey(Buffer.alloc(32, Math.random().toString(), 'ascii'))
      const pubKey = await pair.publicKey()
      const address = Bech32.fromPubKey(pubKey, 'bcrt')

      const txid = await client.wallet.sendToken('0', '10', address)
      expect(txid.length).toStrictEqual(64)

      await waitForExpect(async () => {
        const balances = await container.call('getaccount', [address])
        expect(balances).toStrictEqual(['10.00000000@DFI'])
      })
    })

    await Promise.all(promises)
  })
})
