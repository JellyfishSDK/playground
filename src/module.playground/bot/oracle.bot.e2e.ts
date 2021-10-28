import { PlaygroundTesting } from '@src/e2e.module'
import waitForExpect from 'wait-for-expect'
import { SetupOracle } from '../setup/setup.oracle'

const testing = new PlaygroundTesting()

beforeAll(async () => {
  await testing.start()
})

afterAll(async () => {
  await testing.stop()
})

describe('oracle bot', () => {
  it('should change oracle price', async () => {
    const oracles = await testing.client.oracle.listOracles()
    expect(Object.values(oracles).length).toBe(6)

    const setupOracle = testing.app.get(SetupOracle)
    const oracleIds = setupOracle.oracleIds.U10

    await waitForExpect(async () => {
      const oracleData = await testing.client.oracle.getOracleData(oracleIds[0])

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
    }, 200000)
  })
})
