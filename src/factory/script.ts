import {NetworkResourceResponse, ScriptConfig} from '../types'
import {stall} from '../utils'

export function createScript(config: ScriptConfig): NetworkResourceResponse {
  return {
    config,
    headers: {'content-type': 'application/javascript'},
    body: `
    ${stall.toString()}

    stall(${Number(config.executionDuration) || 0})
    `,
  }
}

export function injectScriptBytes(body: string, totalByteTarget: number): string {
  const currentBytes = body.length
  const comment = `\n/*  */`
  const bytesNeeded = totalByteTarget - currentBytes - comment.length
  const injection = comment.replace('  ', ` ${'0'.repeat(bytesNeeded)} `)
  return `${body}${injection}`
}
