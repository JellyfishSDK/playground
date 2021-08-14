import { MasterNodeRegTestContainer } from '@defichain/testcontainers'
import { PlaygroundApiClient } from '../../src'
import { StubPlaygroundApiClient } from '../stub.client'
import { StubService } from '../stub.service'
import { Bech32, Elliptic } from '@defichain/jellyfish-crypto'
import crypto from 'crypto'

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

    const balances = await container.call('getaccount', [address])
    expect(balances).toStrictEqual(['15.99134567@DFI'])
  })

  it('should keep sending 10.00000000@DFI to address x30 times', async () => {
    const addresses = await generateAddress(30)
    const promises = addresses.map(async address => {
      const txid = await client.wallet.sendToken('0', '10', address)
      expect(txid.length).toStrictEqual(64)

      const balances: string[] = await container.call('getaccount', [address])
      return balances[0]
    })

    const all: string[] = await Promise.all(promises)
    const total = all.reduce((prev, c) => {
      if (c === undefined) {
        return prev
      }
      const [amount] = c.split('@')
      return prev + Number(amount)
    }, 0)

    expect(total).toStrictEqual(300)
  })

  it('should send token 1 to address and wait for confirmation', async () => {
    const address = 'bcrt1qur2tmednr6e52u9du972nqvua60egwqkf98ps8'
    const txid = await client.wallet.sendToken('1', '1.2343134', address)
    expect(txid.length).toStrictEqual(64)

    const balances = await container.call('getaccount', [address])
    expect(balances).toStrictEqual(['1.23431340@BTC'])
  })

  it('should send token 2 to address and wait for confirmation', async () => {
    const address = 'bcrt1qhu2pkzfx4gc8r5nry89ma9xvvt6rz0r4xe5yyw'
    const txid = await client.wallet.sendToken('2', '1.500', address)
    expect(txid.length).toStrictEqual(64)

    const balances = await container.call('getaccount', [address])
    expect(balances).toStrictEqual(['1.50000000@ETH'])
  })
})

async function generateAddress (n: number): Promise<string[]> {
  return await Promise.all([...Array(n).keys()].map(async () => {
    const pair = Elliptic.fromPrivKey(crypto.randomBytes(32))
    const pubKey = await pair.publicKey()
    return Bech32.fromPubKey(pubKey, 'bcrt')
  }))
}
