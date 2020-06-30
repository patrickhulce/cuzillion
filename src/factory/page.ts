import {
  PageConfig,
  NetworkResourceResponse,
  IFactory,
  ScriptInclusionConfig,
  ResourceType,
  ScriptInclusionType,
} from '../types'

const EMPTY_BODY = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <!--HEAD-->
  </head>
  <body>
    <!--BODY-->
  </body>
</html>
`.trim()

function createScriptTag(config: ScriptInclusionConfig, factory: IFactory): string {
  const {inclusionType = ScriptInclusionType.External} = config
  const scriptResource = factory.create(config)
  if (inclusionType === ScriptInclusionType.Inline) {
    return `<script>${scriptResource.body}</script>`
  } else {
    const attributes =
      inclusionType === ScriptInclusionType.ExternalDefer
        ? 'defer'
        : inclusionType === ScriptInclusionType.ExternalAsync
        ? 'async'
        : ''
    return `<script src=${JSON.stringify(scriptResource.link)} ${attributes}></script>`
  }
}

function createHtmlChildren(children: PageConfig['body'], factory: IFactory): string {
  let html = ''
  if (!children) return html

  for (const child of children) {
    switch (child.type) {
      case ResourceType.Script:
        html += createScriptTag(child, factory)
        break
      default:
        throw new Error(`${child.type} not supported`)
    }
  }

  return html
}

export function createPage(
  config: PageConfig,
  factory: IFactory,
): Omit<NetworkResourceResponse, 'link'> {
  let body = EMPTY_BODY
  config = factory.recursivelyFillIds(config) as any
  if (config.head) body = body.replace('<!--HEAD-->', createHtmlChildren(config.head, factory))
  if (config.body) body = body.replace('<!--BODY-->', createHtmlChildren(config.body, factory))

  return {
    config,
    headers: {'content-type': 'text/html'},
    body,
  }
}

export function injectPageBytes(body: string, totalByteTarget: number): string {
  const currentBytes = body.length
  const comment = `<!--  -->`
  const bytesNeeded = totalByteTarget - currentBytes - comment.length
  const injection = comment.replace('  ', ` ${'0'.repeat(bytesNeeded)} `)
  return body.replace('</body>', `${injection}</body>`)
}
