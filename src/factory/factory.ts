import {ConfigType, CuzillionConfig, NetworkResourceResponse, IFactory} from '../types'
import {createPage, injectPageBytes} from './page'
import {injectScriptBytes, createScript} from './script'
import {serializeConfig} from '../serialization'
import {injectStylesheetBytes, createStylesheet} from './stylesheet'
import {injectTextBytes, createText} from './text'
import {createImage} from './image'

const DEFAULT_URL_MAP = {
  [ConfigType.Page]: '/factory/page.html',
  [ConfigType.Script]: '/factory/script.js',
  [ConfigType.Stylesheet]: '/factory/style.css',
  [ConfigType.Image]: '/factory/image.jpg',
  [ConfigType.Text]: '/not-supported',
}

export class Factory implements IFactory {
  private _urlMap: Record<ConfigType, string>

  public constructor(urlMap: Record<ConfigType, string>) {
    this._urlMap = urlMap
  }

  public getLinkTo(config: CuzillionConfig): string {
    const url = new URL(this._urlMap[config.type], 'http://localhost')
    url.searchParams.set('config', serializeConfig(config))
    return `${url.pathname}${url.search}`
  }

  public create(config: CuzillionConfig): NetworkResourceResponse {
    switch (config.type) {
      case ConfigType.Page:
        return {...createPage(config, this), link: this.getLinkTo(config)}
      case ConfigType.Script:
        return {...createScript(config, this), link: this.getLinkTo(config)}
      case ConfigType.Stylesheet:
        return {...createStylesheet(config, this), link: this.getLinkTo(config)}
      case ConfigType.Text:
        return {...createText(config, this), link: this.getLinkTo(config)}
      case ConfigType.Image:
        return {...createImage(config, this), link: this.getLinkTo(config)}
    }
  }

  public injectBytes(
    config: CuzillionConfig,
    body: Buffer | string | undefined,
  ): Buffer | string | undefined {
    if (body === undefined || !config.sizeInBytes) return body
    if (Buffer.isBuffer(body)) throw new Error('Buffer byte injection not supported')

    switch (config.type) {
      case ConfigType.Page:
        return injectPageBytes(body, config.sizeInBytes)
      case ConfigType.Script:
        return injectScriptBytes(body, config.sizeInBytes)
      case ConfigType.Stylesheet:
        return injectStylesheetBytes(body, config.sizeInBytes)
      case ConfigType.Text:
        return injectTextBytes(body, config.sizeInBytes)
      default:
        throw new Error(`${config.type} not yet supported for injection`)
    }
  }

  public static defaultInstance(): IFactory {
    const factory = new Factory(DEFAULT_URL_MAP)
    factory.getLinkTo = factory.getLinkTo.bind(factory)
    factory.create = factory.create.bind(factory)
    factory.injectBytes = factory.injectBytes.bind(factory)
    return factory
  }
}
