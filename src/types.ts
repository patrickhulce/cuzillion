interface NetworkResource {
  type: ResourceType
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

export enum ScriptType {
  External,
  Inline,
  Eval,
}

export interface PageConfig extends NetworkResource {
  head?: Array<ScriptConfig | StyleConfig>
  body?: Array<ScriptConfig | StyleConfig | ImageConfig | TextConfig>
}

export interface ScriptConfig extends NetworkResource {
  executionDuration?: number
}

export interface StyleConfig extends NetworkResource {
  evaluationTime?: number
}

export interface TextConfig extends NetworkResource {
  type: ResourceType
  value?: string
}

export interface ImageConfig extends NetworkResource {}

export type CuzillionConfig = PageConfig | ScriptConfig | StyleConfig | TextConfig | ImageConfig
