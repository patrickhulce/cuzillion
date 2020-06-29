import {CuzillionConfig} from './types'
import debug from 'debug'

const log = debug('cuzillion:serialization')

export function serializeConfig(config: CuzillionConfig): string {
  return Buffer.from(JSON.stringify(config)).toString('base64')
}

function validateConfig(o: unknown): CuzillionConfig {
  if (typeof o !== 'object') throw new Error(`Config is not an object`)
  if (!o) throw new Error(`Config is null`)
  if (!('type' in o)) throw new Error(`Config did not set type`)
  return o as CuzillionConfig
}

export function deserializeConfig(s: string): CuzillionConfig | undefined {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(s, 'base64').toString())
    return validateConfig(parsed)
  } catch (err) {
    log(`config validation error: ${err.stack}`)
    return undefined
  }
}
