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
  body: string
}

export enum ResourceType {
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

export interface PageConfig extends NetworkResource {
  type: ResourceType.Page
  head?: Array<ScriptConfig | StyleConfig>
  body?: Array<ScriptConfig | StyleConfig | ImageConfig | TextConfig>
}

export interface ScriptConfig extends NetworkResource {
  type: ResourceType.Script
  executionDuration?: number
  inclusionType?: ScriptInclusionType
}

export interface StyleConfig extends NetworkResource {
  type: ResourceType.Stylesheet
  backgroundColor?: string
  textColor?: string
  inclusionType?: StylesheetInclusionType
}

export interface TextConfig extends NetworkResource {
  type: ResourceType.Text
  textContent?: string
}

export interface ImageConfig extends NetworkResource {
  type: ResourceType.Image
}

export type CuzillionConfig = PageConfig | ScriptConfig | StyleConfig | TextConfig | ImageConfig

export interface IFactory {
  getLinkTo(config: CuzillionConfig): string
  create(config: CuzillionConfig): NetworkResourceResponse
  injectBytes(config: CuzillionConfig, body: string | undefined): string | undefined
  recursivelyFillIds(config: CuzillionConfig, state?: {current: number}): CuzillionConfig
}

interface ConfigDefaultsMap {
  [ResourceType.Page](page: PageConfig): Required<PageConfig>
  [ResourceType.Script](page: ScriptConfig): Required<ScriptConfig>
  [ResourceType.Stylesheet](page: StyleConfig): Required<StyleConfig>
  [ResourceType.Image](page: ImageConfig): Required<ImageConfig>
  [ResourceType.Text](page: TextConfig): Required<TextConfig>
}

const defaultNetworkResource: Required<NetworkResource> = {
  id: '',
  statusCode: 200,
  redirectCount: 0,
  fetchDelay: 0,
  sizeInBytes: 0,
}

const configDefaults: ConfigDefaultsMap = {
  [ResourceType.Page](config: PageConfig) {
    return {
      ...defaultNetworkResource,
      head: [],
      body: [],
      ...config,
    }
  },
  [ResourceType.Script](config: ScriptConfig) {
    return {
      ...defaultNetworkResource,
      executionDuration: 0,
      inclusionType: ScriptInclusionType.External,
      ...config,
    }
  },
  [ResourceType.Stylesheet](config: StyleConfig) {
    return {
      ...defaultNetworkResource,
      inclusionType: StylesheetInclusionType.External,
      backgroundColor: '',
      textColor: '',
      ...config,
    }
  },
  [ResourceType.Image](config: ImageConfig) {
    return {
      ...defaultNetworkResource,
      ...config,
    }
  },
  [ResourceType.Text](config: TextConfig) {
    return {
      ...defaultNetworkResource,
      textContent: 'Hello, World!',
      ...config,
    }
  },
}

export function withDefaults<T extends CuzillionConfig>(config: T): Required<T> {
  const configWithDefaults =
    config.type in configDefaults ? configDefaults[config.type](config as any) : config
  return configWithDefaults as any
}
