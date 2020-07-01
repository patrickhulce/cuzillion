import {NetworkResourceResponse, ScriptConfig, IFactory, withDefaults} from '../types'
import {stall} from '../utils'

export function createScript(
  config: ScriptConfig,
  factory: IFactory,
): Omit<NetworkResourceResponse, 'link'> {
  const {executionDuration, id} = withDefaults(config)
  const script = `
    console.log('script ID ${id} started');
    ${stall.toString()};
    stall(${Number(executionDuration)});
    console.log('script ID ${id} done');
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
