import { Global, Module, OnApplicationBootstrap } from '@nestjs/common'
import { PlaygroundToken } from '@src/module.playground/playground.token'
import { PlaygroundDex } from '@src/module.playground/playground.dex'
import { PlaygroundProbeIndicator } from '@src/module.playground/playground.indicator'

@Global()
@Module({
  providers: [
    PlaygroundToken,
    PlaygroundDex,
    PlaygroundProbeIndicator
  ],
  exports: [
    PlaygroundProbeIndicator
  ]
})
export class PlaygroundModule implements OnApplicationBootstrap {
  constructor (
    private readonly token: PlaygroundToken,
    private readonly dex: PlaygroundDex,
    private readonly indicator: PlaygroundProbeIndicator
  ) {
  }

  async onApplicationBootstrap (): Promise<void> {
    await this.token.init()
    await this.dex.init()
    this.indicator.ready = true
  }
}
