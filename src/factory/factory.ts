import {ResourceType, CuzillionConfig, NetworkResourceResponse} from '../types'
import {createPage, injectPageBytes} from './page'
import {injectScriptBytes, createScript} from './script'

export class Factory {
  public create(config: CuzillionConfig): NetworkResourceResponse {
    switch (config.type) {
      case ResourceType.Page:
        return createPage(config)
      case ResourceType.Script:
        return createScript(config)
      default:
        throw new Error(`${config.type} not yet supported`)
    }
  }

  public injectBytes(config: CuzillionConfig, body: string | undefined): string | undefined {
    if (body === undefined || !config.sizeInBytes) return body

    switch (config.type) {
      case ResourceType.Page:
        return injectPageBytes(body, config.sizeInBytes)
      case ResourceType.Script:
        return injectScriptBytes(body, config.sizeInBytes)
      default:
        throw new Error(`${config.type} not yet supported`)
    }
  }
}
