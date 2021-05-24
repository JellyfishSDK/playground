/**
 * AppConfiguration declares a dictionary for a deeply configurable DeFi playground setup.
 * `process.env` resolves env variable at service initialization and allows setting of default.
 * This configuration can be injected/replaced at runtime by overriding provider 'ConfigService' or
 * replacing the config module.
 */
export const AppConfiguration = (): any => ({
  defid: {
    url: process.env.PLAYGROUND_DEFID_URL,
    liveness: {
      maxBlockCount: 100000
    }
  }
})
