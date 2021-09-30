import { MasterNodeRegTestContainer } from '@defichain/testcontainers'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { createTestingApp, stopTestingApp } from '@src/e2e.module'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import BigNumber from 'bignumber.js'

const container = new MasterNodeRegTestContainer()
let client: JsonRpcClient
let app: NestFastifyApplication

beforeAll(async () => {
  await container.start()
  await container.waitForWalletCoinbaseMaturity()
  app = await createTestingApp(container)
  client = new JsonRpcClient(await container.getCachedRpcUrl())
})

afterAll(async () => {
  await stopTestingApp(container, app)
})

it('should have pool pairs setup', async () => {
  const pairs = await client.poolpair.listPoolPairs()
  expect(Object.values(pairs).length).toBe(5)
})

it('should have tokens setup', async () => {
  const tokens = await client.token.listTokens()
  expect(Object.values(tokens).length).toBe(11)
})

it('should have oracles setup', async () => {
  const oracles = await client.oracle.listOracles()
  expect(Object.values(oracles).length).toBe(4)
})

it('should have masternode setup', async () => {
  const oracles = await client.masternode.listMasternodes()
  expect(Object.values(oracles).length).toBe(10)
})

it('should not have minted more than 200 blocks', async () => {
  const count = await client.blockchain.getBlockCount()
  expect(count).toBeLessThanOrEqual(200)
})

it('should have at least 199 million in balance', async () => {
  const m199 = new BigNumber('199100100')
  const balances = await client.wallet.getBalances()
  expect(balances.mine.trusted.isGreaterThan(m199)).toStrictEqual(true)
})
