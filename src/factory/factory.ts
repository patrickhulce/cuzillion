import {ResourceType, CuzillionConfig, NetworkResourceResponse, IFactory} from '../types'
import {createPage, injectPageBytes} from './page'
import {injectScriptBytes, createScript} from './script'
import {serializeConfig} from '../serialization'
import {injectStylesheetBytes, createStylesheet} from './stylesheet'
import {injectTextBytes, createText} from './text'

const DEFAULT_URL_MAP = {
  [ResourceType.Page]: '/factory/page.html',
  [ResourceType.Script]: '/factory/script.js',
  [ResourceType.Stylesheet]: '/factory/style.css',
  [ResourceType.Image]: '/factory/image.jpg',
  [ResourceType.Text]: '/factory/article.txt',
}

export class Factory implements IFactory {
  private _urlMap: Record<ResourceType, string>

  public constructor(urlMap: Record<ResourceType, string>) {
    this._urlMap = urlMap
  }

  public getLinkTo(config: CuzillionConfig): string {
    const url = new URL(this._urlMap[config.type], 'http://localhost')
    url.searchParams.set('config', serializeConfig(config))
    return `${url.pathname}${url.search}`
  }

  public create(config: CuzillionConfig): NetworkResourceResponse {
    switch (config.type) {
      case ResourceType.Page:
        return {...createPage(config, this), link: this.getLinkTo(config)}
      case ResourceType.Script:
        return {...createScript(config, this), link: this.getLinkTo(config)}
      case ResourceType.Stylesheet:
        return {...createStylesheet(config, this), link: this.getLinkTo(config)}
      case ResourceType.Text:
        return {...createText(config, this), link: this.getLinkTo(config)}
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
      case ResourceType.Stylesheet:
        return injectStylesheetBytes(body, config.sizeInBytes)
      case ResourceType.Text:
        return injectTextBytes(body, config.sizeInBytes)
      default:
        throw new Error(`${config.type} not yet supported`)
    }
  }

  public recursivelyFillIds(config: CuzillionConfig, state?: {current: number}): CuzillionConfig {
    state = state || {current: 0}

    config.id = config.id || `${state.current++}`
    switch (config.type) {
      case ResourceType.Page:
        if (config.head)
          config.head = config.head.map((child) => this.recursivelyFillIds(child, state) as any)
        if (config.body)
          config.body = config.body.map((child) => this.recursivelyFillIds(child, state) as any)
        break
    }

    return config
  }

  public static defaultInstance(): IFactory {
    const factory = new Factory(DEFAULT_URL_MAP)
    factory.getLinkTo = factory.getLinkTo.bind(factory)
    factory.create = factory.create.bind(factory)
    factory.injectBytes = factory.injectBytes.bind(factory)
    return factory
  }
}
