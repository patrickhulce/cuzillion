interface NetworkResource {
  type: ResourceType
  id?: string
  fetchDelay?: number
  redirectCount?: number
  statusCode?: number
  sizeInBytes?: number
}

export interface NetworkResourceResponse {
  config?: CuzillionConfig
  headers?: Record<string, string>
  body?: string
}

export enum ResourceType {
  Page,
  Script,
  Stylesheet,
  Image,
  Text,
}

export enum ScriptInclusionType {
  External,
  Inline,
}

export interface ExternalScriptAttributes {
  defer?: boolean
  async?: boolean
}

export interface ScriptInclusionConfig {
  inclusionType?: ScriptInclusionType
  externalAttributes?: ExternalScriptAttributes
  script?: ScriptConfig
}

export interface PageConfig extends NetworkResource {
  head?: Array<ScriptConfig | StyleConfig>
  body?: Array<ScriptConfig | StyleConfig | ImageConfig | TextConfig>
}

export interface ScriptConfig extends NetworkResource {
  executionDuration?: number
}

export interface StyleConfig extends NetworkResource {
  backgroundColor?: string
  textColor?: string
}

export interface TextConfig extends NetworkResource {
  textContent?: string
}

export interface ImageConfig extends NetworkResource {}

export type CuzillionConfig = PageConfig | ScriptConfig | StyleConfig | TextConfig | ImageConfig

export interface IFactory {
  create(config: CuzillionConfig): NetworkResourceResponse
}
