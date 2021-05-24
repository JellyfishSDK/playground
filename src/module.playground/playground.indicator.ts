import { Injectable } from '@nestjs/common'
import { ProbeIndicator, HealthIndicatorResult } from '@src/module.health/probe.indicator'

@Injectable()
export class PlaygroundProbeIndicator extends ProbeIndicator {
  ready: boolean = false

  async liveness (): Promise<HealthIndicatorResult> {
    return this.withAlive('playground')
  }

  /**
   * Check the readiness of DeFiD.
   */
  async readiness (): Promise<HealthIndicatorResult> {
    if (this.ready) {
      return this.withAlive('playground')
    }

    return this.withDead('playground', 'playground is not yet ready')
  }
}
