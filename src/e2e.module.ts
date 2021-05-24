import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { ConfigService } from '@nestjs/config'
import { MasterNodeRegTestContainer } from '@defichain/testcontainers'
import { newFastifyAdapter } from '@src/fastify'
import { NestFastifyApplication } from '@nestjs/platform-fastify'

/**
 * Configures an end-to-end testing app integrated with all modules.
 * Memory database will be used by default.
 * DeFiD client will be provided by @defichain/testcontainers.
 *
 * @param {MasterNodeRegTestContainer} container to provide defid client
 * @return Promise<NestFastifyApplication> with initialization
 */
export async function createTestingApp (container: MasterNodeRegTestContainer): Promise<NestFastifyApplication> {
  const url = await container.getCachedRpcUrl()
  const module = await createTestingModule(url)
  const app = module.createNestApplication<NestFastifyApplication>(
    newFastifyAdapter({
      logger: false
    })
  )
  await app.init()
  return app
}

/**
 * @param {MasterNodeRegTestContainer} container to provide defid client
 * @param {NestFastifyApplication} app to close
 */
export async function stopTestingApp (container: MasterNodeRegTestContainer, app: NestFastifyApplication): Promise<void> {
  try {
    await app.close()
  } finally {
    await new Promise((resolve) => {
      // Wait 2000ms between indexer cycle time to prevent database error
      setTimeout(_ => resolve(0), 500)
    })
    await container.stop()
  }
}

async function createTestingModule (url: string): Promise<TestingModule> {
  return await Test.createTestingModule({
    imports: [AppModule.forRoot()]
  })
    .overrideProvider(ConfigService).useValue(new TestConfigService(url))
    .compile()
}

/**
 * Override default ConfigService for E2E testing
 */
class TestConfigService extends ConfigService {
  constructor (rpcUrl: string) {
    super({
      defid: {
        url: rpcUrl,
        liveness: {
          maxBlockCount: 10000
        },
        readiness: {
          minBlockCount: 200
        }
      }
    })
  }
}
