import { APP_INTERCEPTOR } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { RpcController } from '@src/module.api/rpc.controller'
import { HealthController } from '@src/module.api/health.controller'
import { ExceptionInterceptor } from '@src/module.api/interceptors/exception.interceptor'
import { ResponseInterceptor } from '@src/module.api/interceptors/response.interceptor'
import { PlaygroundController } from '@src/module.api/playground.controller'

/**
 * Exposed ApiModule for public interfacing
 */
@Module({
  controllers: [
    HealthController,
    RpcController,
    PlaygroundController
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ExceptionInterceptor }
  ]
})
export class ApiModule {
}
