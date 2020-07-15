import {CuzillionConfig, walkConfig, withDefaults} from './types'
import debug from 'debug'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'

const log = debug('cuzillion:serialization')

function recursizelyTrimDefaults(config: CuzillionConfig): void {
  walkConfig(config, config => {
    const configWithDefaults = withDefaults({type: config.type} as CuzillionConfig)
    for (const key_ of Object.keys(config)) {
      const key = key_ as keyof CuzillionConfig
      if (key === 'type') continue
      if (isEqual(config[key], configWithDefaults[key])) delete config[key]
    }
  })
}

function recursizelyHydrateDefaults(config: CuzillionConfig): void {
  walkConfig(config, config => {
    Object.assign(config, withDefaults(config))
  })
}

export function serializeConfig(config: CuzillionConfig): string {
  const cloned = cloneDeep(config)
  recursizelyTrimDefaults(cloned)
  return Buffer.from(JSON.stringify(cloned).replace(/"type":"/g, '"t":"')).toString('base64')
}

function validateConfig(o: unknown): CuzillionConfig {
  if (typeof o !== 'object') throw new Error(`Config is not an object`)
  if (!o) throw new Error(`Config is null`)
  if (!('type' in o)) throw new Error(`Config did not set type`)
  return o as CuzillionConfig
}

export function deserializeConfig(s: string): CuzillionConfig | undefined {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(s, 'base64').toString().replace(/"t":"/g, '"type":"'),
    )
    const config = validateConfig(parsed)
    recursizelyHydrateDefaults(config)
    return config
  } catch (err) {
    log(`config validation error: ${err.stack}`)
    return undefined
  }
}
