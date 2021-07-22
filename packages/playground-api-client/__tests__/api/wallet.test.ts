import { MasterNodeRegTestContainer } from '@defichain/testcontainers'
import { PlaygroundApiClient } from '../../src'
import { StubPlaygroundApiClient } from '../stub.client'
import { StubService } from '../stub.service'
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
      { id: '8', balance: expect.any(Number) }
    ]
  })
})

it('should dfi token send to address and wait for automated block confirmation', async () => {
  const address = 'bcrt1qgpu5k3v66qjf8lc4p4lny0uwdxv6vf94axnjkf'

  const txId = await client.wallet.sendTokenDfiToAddress({
    address: address,
    amount: '10'
  })

  expect(txId.length).toStrictEqual(64)

  await waitForExpect(async () => {
    const balances = await container.call('getaccount', [address])
    expect(balances).toStrictEqual(['10.00000000@DFI'])
  })
})
