import {NetworkResourceResponse, ScriptConfig, IFactory} from '../types'
import {stall} from '../utils'

export function createScript(
  config: ScriptConfig,
  factory: IFactory,
): Omit<NetworkResourceResponse, 'link'> {
  let script = `console.log('script ID ${config.id} started');`
  if (typeof config.executionDuration === 'number') {
    script += `
    ${stall.toString()};
    stall(${Number(config.executionDuration) || 0});
    `
  }

  script += `
    console.log('script ID ${config.id} done');
  `

  return {
    config,
    headers: {'content-type': 'application/javascript'},
    body: script,
  }
}

export function injectScriptBytes(body: string, totalByteTarget: number): string {
  const currentBytes = body.length
  const comment = `\n/*  */`
  const bytesNeeded = totalByteTarget - currentBytes - comment.length
  const injection = comment.replace('  ', ` ${'0'.repeat(bytesNeeded)} `)
  return `${body}${injection}`
}
