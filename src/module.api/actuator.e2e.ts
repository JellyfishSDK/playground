import { MasterNodeRegTestContainer } from '@defichain/testcontainers'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { createTestingApp, stopTestingApp } from '@src/e2e.module'

const container = new MasterNodeRegTestContainer()
let app: NestFastifyApplication

beforeAll(async () => {
  await container.start()
  await container.waitForReady()
  app = await createTestingApp(container)
})

afterAll(async () => {
  await stopTestingApp(container, app)
})

describe('/_actuator/probes/liveness', () => {
  it('should wait until liveness', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/_actuator/probes/liveness'
    })

    expect(res.statusCode).toStrictEqual(200)
    expect(res.json()).toStrictEqual({
      details: {
        defid: {
          status: 'up'
        },
        playground: {
          status: 'up'
        }
      },
      error: {},
      info: {
        defid: {
          status: 'up'
        },
        playground: {
          status: 'up'
        }
      },
      status: 'ok'
    })
  })
})

describe('/_actuator/probes/readiness', () => {
  it('should wait until readiness', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/_actuator/probes/readiness'
    })

    expect(res.statusCode).toStrictEqual(200)
  })
})
