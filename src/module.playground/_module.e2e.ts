import { MasterNodeRegTestContainer } from '@defichain/testcontainers'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { createTestingApp, stopTestingApp } from '@src/e2e.module'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'

const container = new MasterNodeRegTestContainer()
let client: JsonRpcClient
let app: NestFastifyApplication

beforeAll(async () => {
  await container.start()
  await container.waitForReady()
  await container.waitForWalletCoinbaseMaturity()
  app = await createTestingApp(container)
  client = new JsonRpcClient(await container.getCachedRpcUrl())
})

afterAll(async () => {
  await stopTestingApp(container, app)
})

it('should have pool pairs setup', async () => {
  const pairs = await client.poolpair.listPoolPairs()
  expect(Object.values(pairs).length).toBe(4)
})

it('should have tokens setup', async () => {
  const tokens = await client.token.listTokens()
  expect(Object.values(tokens).length).toBe(9)
})
