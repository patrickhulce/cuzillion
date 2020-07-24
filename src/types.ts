import isEqual from 'lodash/isEqual'

export enum OriginPreference {
  SameOrigin = '/',
  Primary = 'p1',
  Secondary = 'p2',
  Tertiary = 'p3',
  Quaternary = 'p4',
}

interface NetworkResource {
  id?: string
  originPreference?: OriginPreference
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
  ScriptAction = 'jsa',
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

export enum ScriptActionType {
  Stall = 'stall',
  XHR = 'xhr',
  SyncXHR = 'syncxhr',
  Fetch = 'fetch',
  SetTimeout = 'timeout',
  LoadListener = 'load',
  DCLListener = 'dcl',
  AddElement = 'element',
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

export interface ScriptActionConfig {
  type: ConfigType.ScriptAction
  actionType?: ScriptActionType
  id?: string
  executionDuration?: number
  timeoutDelay?: number
  dependent?: Required<PageConfig>['body'][0]
  onComplete?: Array<ScriptActionConfig>
}

export interface ScriptConfig extends NetworkResource {
  type: ConfigType.Script
  creationMethod?: ElementCreationMethod
  executionDuration?: number
  inclusionType?: ScriptInclusionType
  actions?: Array<ScriptActionConfig>
}

export interface StyleConfig extends NetworkResource {
  type: ConfigType.Stylesheet
  creationMethod?: ElementCreationMethod
  backgroundColor?: string
  textColor?: string
  inclusionType?: StylesheetInclusionType
}

export interface TextConfig extends NetworkResource {
  type: ConfigType.Text
  creationMethod?: ElementCreationMethod
  textContent?: string
}

export interface ImageConfig extends NetworkResource {
  type: ConfigType.Image
  creationMethod?: ElementCreationMethod
  width?: number
  height?: number
}

export type NetworkResourceConfig =
  | PageConfig
  | ScriptConfig
  | StyleConfig
  | ImageConfig
  | TextConfig
export type NetworkResourceConfigType = NetworkResourceConfig['type']

export type CuzillionConfig = NetworkResourceConfig | ScriptActionConfig

export interface IFactory {
  setOrigins(origins: string[]): void
  getLinkTo(config: NetworkResourceConfig): string
  create(config: NetworkResourceConfig): NetworkResourceResponse
  injectBytes(
    config: NetworkResourceConfig,
    body: Buffer | string | undefined,
  ): Buffer | string | undefined
}

interface ConfigDefaultsMap {
  [ConfigType.Page](page: PageConfig): Required<PageConfig>
  [ConfigType.Script](page: ScriptConfig): Required<ScriptConfig>
  [ConfigType.ScriptAction](page: ScriptActionConfig): Required<ScriptActionConfig>
  [ConfigType.Stylesheet](page: StyleConfig): Required<StyleConfig>
  [ConfigType.Image](page: ImageConfig): Required<ImageConfig>
  [ConfigType.Text](page: TextConfig): Required<TextConfig>
}

export const defaultNetworkResource: Required<NetworkResource> = {
  id: '',
  originPreference: OriginPreference.SameOrigin,
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
      actions: [],
      ...config,
    }
  },
  [ConfigType.ScriptAction](config: ScriptActionConfig) {
    return {
      ...defaultNetworkResource,
      actionType: ScriptActionType.Stall,
      onComplete: [],
      executionDuration: 0,
      timeoutDelay: 2000,
      dependent: {type: ConfigType.Text},
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
      ...defaultNetworkResource,
      textContent: 'Hello, Cuzillion!',
      creationMethod: ElementCreationMethod.HTML,
      ...config,
    }
  },
}

export const EMPTY_PAGE: PageConfig = {type: ConfigType.Page, body: [{type: ConfigType.Text}]}

export function isNetworkResource(
  config: CuzillionConfig,
  parent?: CuzillionConfig,
): config is NetworkResourceConfig {
  if (config.type === ConfigType.ScriptAction) return false
  if (config.type === ConfigType.Text && parent?.type === ConfigType.Page) return false
  return true
}

export function withDefaults<T extends CuzillionConfig>(config: T): Required<T> {
  const configWithUndefinedDropped = {...config}
  for (const key_ of Object.keys(config)) {
    const key = key_ as keyof T
    if (config[key] === undefined) delete configWithUndefinedDropped[key]
  }
  const configWithDefaults =
    config.type in configDefaults
      ? configDefaults[config.type](configWithUndefinedDropped as any)
      : config
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
    case ConfigType.Script:
      if (config.actions) config.actions.forEach(child => walkConfig(child, processFn))
      break
    case ConfigType.ScriptAction:
      if (config.dependent) walkConfig(config.dependent, processFn)
      if (config.onComplete) config.onComplete.forEach(child => walkConfig(child, processFn))
      break
  }
}

export function initializeIds(config: CuzillionConfig): void {
  let currentId = 0
  walkConfig(config, config => {
    currentId = Math.max(Number(config.id) || 0, currentId)
  })

  const state = {count: currentId + 1}
  walkConfig(config, config => {
    if (!config.id) config.id = `${state.count++}`
  })
}
