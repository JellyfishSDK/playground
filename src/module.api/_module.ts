import { APP_INTERCEPTOR } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { RpcController } from '@src/module.api/rpc.controller'
import { ActuatorController } from '@src/module.api/actuator.controller'
import { ExceptionInterceptor } from '@src/module.api/interceptors/exception.interceptor'
import { ResponseInterceptor } from '@src/module.api/interceptors/response.interceptor'
import { PlaygroundController } from '@src/module.api/playground.controller'
import { WalletController } from '@src/module.api/wallet.controller'

/**
 * Exposed ApiModule for public interfacing
 */
@Module({
  controllers: [
    ActuatorController,
    RpcController,
    PlaygroundController,
    WalletController
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ExceptionInterceptor }
  ]
})
export class ApiModule {
}
