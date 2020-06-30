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
  Page,
  Script,
  Stylesheet,
  Image,
  Text,
}

export enum ScriptInclusionType {
  External,
  ExternalDefer,
  ExternalAsync,
  Inline,
}

export enum StylesheetInclusionType {
  External,
  ExternalAsync,
  Inline,
}

export interface ScriptInclusionConfig extends ScriptConfig {
  inclusionType?: ScriptInclusionType
}

export interface StyleInclusionConfig extends StyleConfig {
  inclusionType?: StyleInclusionConfig
}

export interface PageConfig extends NetworkResource {
  type: ResourceType.Page
  head?: Array<ScriptInclusionConfig | StyleInclusionConfig>
  body?: Array<ScriptInclusionConfig | StyleInclusionConfig | ImageConfig | TextConfig>
}

export interface ScriptConfig extends NetworkResource {
  type: ResourceType.Script
  executionDuration?: number
}

export interface StyleConfig extends NetworkResource {
  type: ResourceType.Stylesheet
  backgroundColor?: string
  textColor?: string
}

export interface TextConfig extends NetworkResource {
  type: ResourceType.Text
  textContent?: string
}

export interface ImageConfig extends NetworkResource {
  type: ResourceType.Image
}

export type CuzillionConfig =
  | PageConfig
  | ScriptConfig
  | StyleConfig
  | TextConfig
  | ImageConfig
  | ScriptInclusionConfig
  | StyleInclusionConfig

export interface IFactory {
  getLinkTo(config: CuzillionConfig): string
  create(config: CuzillionConfig): NetworkResourceResponse
  injectBytes(config: CuzillionConfig, body: string | undefined): string | undefined
  recursivelyFillIds(config: CuzillionConfig, state?: {current: number}): CuzillionConfig
}
