import { PlaygroundTesting } from '@src/e2e.module'
import BigNumber from 'bignumber.js'

const testing = new PlaygroundTesting()

beforeAll(async () => {
  await testing.start()
})

afterAll(async () => {
  await testing.stop()
})

it('should have pool pairs setup', async () => {
  const pairs = await testing.client.poolpair.listPoolPairs()
  expect(Object.values(pairs).length).toBe(5)
})

it('should have tokens setup', async () => {
  const tokens = await testing.client.token.listTokens()
  expect(Object.values(tokens).length).toBe(23)
})

it('should have oracles setup', async () => {
  const oracles = await testing.client.oracle.listOracles()
  expect(Object.values(oracles).length).toBe(6)
})

it('should have masternode setup', async () => {
  const oracles = await testing.client.masternode.listMasternodes()
  expect(Object.values(oracles).length).toBe(10)
})

it('should not have minted more than 200 blocks', async () => {
  const count = await testing.client.blockchain.getBlockCount()
  expect(count).toBeLessThanOrEqual(200)
})

it('should have at least 199 million in balance', async () => {
  const m199 = new BigNumber('199000100')
  const balances = await testing.client.wallet.getBalances()
  console.log(balances.mine.trusted)
  expect(balances.mine.trusted.isGreaterThan(m199)).toStrictEqual(true)
})

it('should have loan schemes', async () => {
  const results = await testing.client.loan.listLoanSchemes()
  expect(results.length).toBe(6)
})

it('should have loan tokens', async () => {
  const results = await testing.client.loan.listLoanTokens()
  expect(results.length).toBe(12)
})

it('should have loan collateral tokens', async () => {
  const results = await testing.client.loan.listCollateralTokens()
  expect(results.length).toBe(13)
})
