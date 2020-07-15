import isEqual from 'lodash/isEqual'

interface NetworkResource {
  id?: string
  fetchDelay?: number
  redirectCount?: number
  statusCode?: number
  sizeInBytes?: number
}

export interface NetworkResourceResponse {
  link: string
  config: CuzillionConfig
  headers: Record<string, string>
  body: string | Buffer
}

export enum ConfigType {
  Page = 'p',
  Script = 'js',
  Stylesheet = 'css',
  Image = 'img',
  Text = 'txt',
}

export enum ScriptInclusionType {
  External = 'external',
  ExternalDefer = 'defer',
  ExternalAsync = 'async',
  Inline = 'inline',
}

export enum StylesheetInclusionType {
  External = 'external',
  ExternalAsync = 'async',
  Inline = 'inline',
}

export enum ElementCreationMethod {
  HTML = 'html',
  DocumentWrite = 'docwrite',
}

export interface PageConfig extends NetworkResource {
  type: ConfigType.Page
  head?: Array<ScriptConfig | StyleConfig>
  body?: Array<ScriptConfig | StyleConfig | ImageConfig | TextConfig>
}

export interface ScriptConfig extends NetworkResource {
  type: ConfigType.Script
  creationMethod?: ElementCreationMethod
  executionDuration?: number
  inclusionType?: ScriptInclusionType
}

export interface StyleConfig extends NetworkResource {
  type: ConfigType.Stylesheet
  creationMethod?: ElementCreationMethod
  backgroundColor?: string
  textColor?: string
  inclusionType?: StylesheetInclusionType
}

export interface TextConfig {
  type: ConfigType.Text
  creationMethod?: ElementCreationMethod
  id?: string
  sizeInBytes?: number
  textContent?: string
}

export interface ImageConfig extends NetworkResource {
  type: ConfigType.Image
  creationMethod?: ElementCreationMethod
  width?: number
  height?: number
}

export type NetworkResourceConfig = PageConfig | ScriptConfig | StyleConfig | ImageConfig

export type CuzillionConfig = NetworkResourceConfig | TextConfig

export interface IFactory {
  getLinkTo(config: CuzillionConfig): string
  create(config: CuzillionConfig): NetworkResourceResponse
  injectBytes(
    config: CuzillionConfig,
    body: Buffer | string | undefined,
  ): Buffer | string | undefined
}

interface ConfigDefaultsMap {
  [ConfigType.Page](page: PageConfig): Required<PageConfig>
  [ConfigType.Script](page: ScriptConfig): Required<ScriptConfig>
  [ConfigType.Stylesheet](page: StyleConfig): Required<StyleConfig>
  [ConfigType.Image](page: ImageConfig): Required<ImageConfig>
  [ConfigType.Text](page: TextConfig): Required<TextConfig>
}

const defaultNetworkResource: Required<NetworkResource> = {
  id: '',
  statusCode: 200,
  redirectCount: 0,
  fetchDelay: 0,
  sizeInBytes: 0,
}

const configDefaults: ConfigDefaultsMap = {
  [ConfigType.Page](config: PageConfig) {
    return {
      ...defaultNetworkResource,
      head: [],
      body: [],
      ...config,
    }
  },
  [ConfigType.Script](config: ScriptConfig) {
    return {
      ...defaultNetworkResource,
      creationMethod: ElementCreationMethod.HTML,
      executionDuration: 0,
      inclusionType: ScriptInclusionType.External,
      ...config,
    }
  },
  [ConfigType.Stylesheet](config: StyleConfig) {
    return {
      ...defaultNetworkResource,
      creationMethod: ElementCreationMethod.HTML,
      inclusionType: StylesheetInclusionType.External,
      backgroundColor: '',
      textColor: '',
      ...config,
    }
  },
  [ConfigType.Image](config: ImageConfig) {
    return {
      ...defaultNetworkResource,
      creationMethod: ElementCreationMethod.HTML,
      width: 100,
      height: 100,
      ...config,
    }
  },
  [ConfigType.Text](config: TextConfig) {
    return {
      id: '',
      sizeInBytes: 0,
      textContent: 'Hello, Cuzillion!',
      creationMethod: ElementCreationMethod.HTML,
      ...config,
    }
  },
}

export const EMPTY_PAGE: PageConfig = {type: ConfigType.Page, body: [{type: ConfigType.Text}]}

export function isNetworkResource(config: CuzillionConfig): config is NetworkResourceConfig {
  return config.type !== ConfigType.Text
}

export function withDefaults<T extends CuzillionConfig>(config: T): Required<T> {
  const configWithDefaults =
    config.type in configDefaults ? configDefaults[config.type](config as any) : config
  return configWithDefaults as any
}

export function hasNonDefaultTypeSettings(config: CuzillionConfig): boolean {
  const typeDefaults = withDefaults<CuzillionConfig>({type: config.type})
  const networkKeys = Object.keys(defaultNetworkResource)
  const typeKeys_ = Object.keys(typeDefaults).filter(key => !networkKeys.includes(key))
  const typeKeys = typeKeys_ as Array<keyof CuzillionConfig>
  return typeKeys.some(key => !isEqual(typeDefaults[key], config[key]))
}

export function hasNonDefaultNetworkSettings(config: CuzillionConfig): boolean {
  if (!isNetworkResource(config)) return false
  const networkKeys = Object.keys(defaultNetworkResource) as Array<keyof NetworkResource>
  return networkKeys.some(key => !isEqual(defaultNetworkResource[key], config[key]))
}

export function walkConfig(config: CuzillionConfig, processFn: (c: CuzillionConfig) => void): void {
  processFn(config)

  switch (config.type) {
    case ConfigType.Page:
      if (config.body) config.body.forEach(child => walkConfig(child, processFn))
      if (config.head) config.head.forEach(child => walkConfig(child, processFn))
      break
  }
}

export function initializeIds(config: CuzillionConfig): void {
  const state = {count: 1}
  walkConfig(config, config => {
    if (!config.id) config.id = `${state.count++}`
  })
}
