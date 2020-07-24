import {
  ConfigType,
  NetworkResourceResponse,
  IFactory,
  NetworkResourceConfigType,
  NetworkResourceConfig,
  OriginPreference,
} from '../types'
import {createPage, injectPageBytes} from './page'
import {injectScriptBytes, createScript} from './script'
import {serializeConfig} from '../serialization'
import {injectStylesheetBytes, createStylesheet} from './stylesheet'
import {injectTextBytes, createText} from './text'
import {createImage} from './image'

const DEFAULT_URL_MAP = {
  [ConfigType.Page]: '/api/page.html',
  [ConfigType.Script]: '/api/script.js',
  [ConfigType.Stylesheet]: '/api/style.css',
  [ConfigType.Image]: '/api/image.jpg',
  [ConfigType.Text]: '/api/text.txt',
}

function isURL(s: string): boolean {
  try {
    new URL(s)
    return true
  } catch (e) {
    return false
  }
}

export class Factory implements IFactory {
  private _urlMap: Record<NetworkResourceConfigType, string>
  private _origins: Array<string>

  public constructor(
    urlMap: Record<NetworkResourceConfigType, string>,
    availableOrigins: string[],
  ) {
    this._urlMap = urlMap
    this._origins = availableOrigins
  }

  public setOrigins(origins: string[]): void {
    this._origins = origins
  }

  public getLinkTo(config: NetworkResourceConfig): string {
    const url = new URL(this._urlMap[config.type], 'http://localhost')
    url.searchParams.set('config', serializeConfig(config))
    const path = `${url.pathname}${url.search}`
    if (!config.originPreference || !this._origins.length) {
      return path
    }

    const index = (n: number) => Math.min(n, this._origins.length - 1)
    switch (config.originPreference) {
      case OriginPreference.Primary:
        return new URL(path, this._origins[index(0)]).href
      case OriginPreference.Secondary:
        return new URL(path, this._origins[index(1)]).href
      case OriginPreference.Tertiary:
        return new URL(path, this._origins[index(2)]).href
      case OriginPreference.Quaternary:
        return new URL(path, this._origins[index(3)]).href
      case OriginPreference.SameOrigin:
      default:
        return path
    }
  }

  public create(config: NetworkResourceConfig): NetworkResourceResponse {
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
    config: NetworkResourceConfig,
    body: Buffer | string | undefined,
  ): Buffer | string | undefined {
    if (body === undefined || !config.sizeInBytes) return body
    if (config.sizeInBytes < body.length) return body
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

  public static defaultOrigins(): string[] {
    return (process.env.CUZILLION_ORIGINS || '').split(' ').filter(isURL)
  }

  public static defaultInstance(): IFactory {
    const factory = new Factory(DEFAULT_URL_MAP, Factory.defaultOrigins())
    factory.getLinkTo = factory.getLinkTo.bind(factory)
    factory.create = factory.create.bind(factory)
    factory.injectBytes = factory.injectBytes.bind(factory)
    return factory
  }
}
