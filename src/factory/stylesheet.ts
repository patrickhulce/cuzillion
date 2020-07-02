import {NetworkResourceResponse, IFactory, StyleConfig} from '../types'
import {injectScriptBytes} from './script'

const EMPTY_STYLESHEET = `
html, body { height: 100vh; margin: 0; box-sizing: border-box; }
body { padding: 10px; }
`.trim()

export function createStylesheet(
  config: StyleConfig,
  factory: IFactory,
): Omit<NetworkResourceResponse, 'link'> {
  let stylesheet = EMPTY_STYLESHEET
  if (config.backgroundColor) {
    stylesheet += `\nbody {background-color: ${config.backgroundColor}}`
  }
  if (config.textColor) {
    stylesheet += `\nbody {color: ${config.textColor}}`
  }

  return {
    config,
    headers: {'content-type': 'text/css'},
    body: stylesheet,
  }
}

export const injectStylesheetBytes = injectScriptBytes
