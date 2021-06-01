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

it('should get info', async () => {
  const info = await client.playground.info()

  expect(info).toStrictEqual({
    block: {
      count: expect.any(Number),
      hash: expect.stringMatching(/[0-f]{64}/)
    }
  })
})

it('should get wallet', async () => {
  const wallet = await client.playground.wallet()

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
      { id: '9', balance: expect.any(Number) }
    ]
  })
})
