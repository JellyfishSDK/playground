import { APP_INTERCEPTOR } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { RpcController } from '@src/module.api/rpc.controller'
import { HealthController } from '@src/module.api/health.controller'
import { ExceptionInterceptor } from '@src/module.api/interceptors/exception.interceptor'
import { ResponseInterceptor } from '@src/module.api/interceptors/response.interceptor'
import { StatsController } from '@src/module.api/stats.controller'

/**
 * Exposed ApiModule for public interfacing
 */
@Module({
  controllers: [
    RpcController,
    HealthController,
    StatsController
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ExceptionInterceptor }
  ]
})
export class ApiModule {
}
