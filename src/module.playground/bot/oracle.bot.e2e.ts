import { MasterNodeRegTestContainer } from '@defichain/testcontainers'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { createTestingApp, stopTestingApp } from '@src/e2e.module'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import waitForExpect from 'wait-for-expect'
import { SetupOracle } from '../setup/setup.oracle'

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

describe('oracle bot', () => {
  it('should change oracle price', async () => {
    const oracles = await client.oracle.listOracles()
    expect(Object.values(oracles).length).toBe(6)

    // Wait for block 157
    await waitForExpect(async () => {
      const blocks = await client.blockchain.getBlockCount()
      expect(blocks).toBeGreaterThan(157)
    }, 200000)

    const setupOracle = app.get(SetupOracle)
    const oracleIds = setupOracle.oracleIds.U10
    const oracleData = await client.oracle.getOracleData(oracleIds[0])

    const tokenPriceU10 = oracleData.tokenPrices.find(x => x.token === 'U10')
    expect(tokenPriceU10?.amount).toStrictEqual(11)

    const tokenPriceU25 = oracleData.tokenPrices.find(x => x.token === 'U25')
    expect(tokenPriceU25?.amount).toStrictEqual(12.5)

    const tokenPriceU50 = oracleData.tokenPrices.find(x => x.token === 'U50')
    expect(tokenPriceU50?.amount).toStrictEqual(15)

    const tokenPriceD10 = oracleData.tokenPrices.find(x => x.token === 'D10')
    expect(tokenPriceD10?.amount).toStrictEqual(9000000)

    const tokenPriceD25 = oracleData.tokenPrices.find(x => x.token === 'D25')
    expect(tokenPriceD25?.amount).toStrictEqual(7500000)

    const tokenPriceD50 = oracleData.tokenPrices.find(x => x.token === 'D50')
    expect(tokenPriceD50?.amount).toStrictEqual(5000000)

    const tokenPriceS25 = oracleData.tokenPrices.find(x => x.token === 'S25')
    expect(tokenPriceS25?.amount).toStrictEqual(25)

    const tokenPriceS50 = oracleData.tokenPrices.find(x => x.token === 'S50')
    expect(tokenPriceS50?.amount).toStrictEqual(50)

    const tokenPriceS100 = oracleData.tokenPrices.find(x => x.token === 'S100')
    expect(tokenPriceS100?.amount).toStrictEqual(100)
  })
})
