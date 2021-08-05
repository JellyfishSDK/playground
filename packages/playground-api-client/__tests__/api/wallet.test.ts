import { MasterNodeRegTestContainer } from '@defichain/testcontainers'
import { PlaygroundApiClient } from '../../src'
import { StubPlaygroundApiClient } from '../stub.client'
import { StubService } from '../stub.service'

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

it('should dfi token send to address and wait for automated block confirmation (deprecated in favor of "wallet/tokens/0/sendtoaddress")', async () => {
  const address = 'bcrt1qgpu5k3v66qjf8lc4p4lny0uwdxv6vf94axnjkf'

  const txId = await client.wallet.sendTokenDfiToAddress({
    address: address,
    amount: '10'
  })

  expect(txId.length).toStrictEqual(64)

  const balances = await container.call('getaccount', [address])
  expect(balances).toStrictEqual(['10.00000000@DFI'])
})

it('should send token 0 to address and wait for automated block confirmation', async () => {
  const address = 'bcrt1qkt7rvkzk8qs7rk54vghrtzcdxfqazscmmp30hk'

  const txId: string = await client.requestData('POST', 'wallet/tokens/0/sendtoaddress', {
    address: address,
    amount: '15.99134567'
  })

  expect(txId.length).toStrictEqual(64)

  const balances = await container.call('getaccount', [address])
  expect(balances).toStrictEqual(['15.99134567@DFI'])
})
