import {
  NetworkResourceResponse,
  ScriptConfig,
  IFactory,
  withDefaults,
  ScriptActionConfig,
  ScriptActionType,
  ConfigType,
} from '../types'
import {stall} from '../utils'

function createActionBody(
  scriptAction: ScriptActionConfig,
  onCompleteBody: string,
  factory: IFactory,
): string {
  const {actionType, executionDuration, dependent, timeoutDelay} = withDefaults(scriptAction)
  switch (actionType) {
    case ScriptActionType.Stall:
      return `stall(${Number(executionDuration)});${onCompleteBody};`
    case ScriptActionType.SetTimeout:
      return `setTimeout(() => { ${onCompleteBody} }, ${Number(timeoutDelay)});`
    case ScriptActionType.LoadListener:
      return `window.addEventListener('load', () => { ${onCompleteBody} });`
    case ScriptActionType.DCLListener:
      return `window.addEventListener('DOMContentLoaded', () => { ${onCompleteBody} });`
    case ScriptActionType.XHR:
    case ScriptActionType.SyncXHR: {
      const xhrLink = factory.getLinkTo(dependent)
      return `(() => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '${xhrLink}', ${actionType === ScriptActionType.XHR});
        xhr.onload = () => { ${onCompleteBody} };
        xhr.send();
      })();`
    }
    case ScriptActionType.Fetch: {
      const fetchLink = factory.getLinkTo(dependent)
      return `fetch('${fetchLink}').then(() => { ${onCompleteBody} });`
    }
    case ScriptActionType.AddElement: {
      const page = factory.create({type: ConfigType.Page, body: [dependent]})
      const bodyHtmlMatch = page.body.toString().match(/<body>([\s\S]+)<\/body>\s*<\/html>$/)
      if (!bodyHtmlMatch) throw new Error('Failed to extract HTML to add via script')
      return `(() => {
        const html = ${JSON.stringify(bodyHtmlMatch[1])};
        const div = document.createElement('div');
        div.innerHTML = html;
        while (div.children.length > 0) document.body.appendChild(div.children[0]);
      })();`
    }
  }
}

function createAction(
  scriptId: string,
  scriptAction: ScriptActionConfig,
  factory: IFactory,
): string {
  const {id, onComplete} = withDefaults(scriptAction)
  let onCompleteBody = ''
  for (const action of onComplete) {
    if (!onCompleteBody) {
      onCompleteBody += `\nconsole.log('script action ${scriptId}.${id} onComplete started');`
    }
    onCompleteBody += `\n${createAction(`${scriptId}.${id}`, action, factory)}`
  }

  if (onCompleteBody) {
    onCompleteBody += `\nconsole.log('script action ${scriptId}.${id} onComplete done');`
  }

  return `
    console.log('script action ${scriptId}.${id} started');
    ${createActionBody(scriptAction, onCompleteBody, factory)}
    console.log('script action ${scriptId}.${id} done');
  `
}

export function createScript(
  config: ScriptConfig,
  factory: IFactory,
): Omit<NetworkResourceResponse, 'link'> {
  const {executionDuration, id, actions} = withDefaults(config)
  let script = `
    console.log('script ID ${id} started');
    ${stall.toString()};
    stall(${Number(executionDuration)});
    console.log('script ID ${id} done');
  `

  for (const action of actions) {
    script += `\n${createAction(id, action, factory)}`
  }

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
