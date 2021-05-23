import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

import { AppConfiguration } from '@src/app.configuration'

import { ApiModule } from '@src/module.api/_module'
import { DeFiDModule } from '@src/module.defid/_module'
import { HealthModule } from '@src/module.health/_module'

@Module({})
export class AppModule {
  static forRoot (): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [AppConfiguration]
        }),
        ScheduleModule.forRoot(),
        DeFiDModule,
        HealthModule,
        ApiModule
      ]
    }
  }
}
