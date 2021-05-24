import { Injectable } from '@nestjs/common'
import { JsonRpcClient } from '@defichain/jellyfish-api-jsonrpc'
import { ProbeIndicator, HealthIndicatorResult } from '@src/module.health/probe.indicator'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class DeFiDProbeIndicator extends ProbeIndicator {
  private readonly livenessMaxBlockCount: number

  constructor (private readonly client: JsonRpcClient, private readonly configService: ConfigService) {
    super()
    this.livenessMaxBlockCount = configService.get<number>('defid.liveness.maxBlockCount', 100000)
  }

  async liveness (): Promise<HealthIndicatorResult> {
    try {
      const count = await this.client.blockchain.getBlockCount()
      if (count > this.livenessMaxBlockCount) {
        return this.withDead('defid', `playground block count is over ${this.livenessMaxBlockCount}`)
      }
    } catch (e) {
      return this.withDead('defid', 'unable to connect to defid')
    }

    return this.withAlive('defid')
  }

  /**
   * Check the readiness of DeFiD.
   */
  async readiness (): Promise<HealthIndicatorResult> {
    return this.withAlive('defid')
  }
}
