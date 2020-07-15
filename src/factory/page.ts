import {
  PageConfig,
  NetworkResourceResponse,
  IFactory,
  ConfigType,
  ScriptInclusionType,
  StylesheetInclusionType,
  ScriptConfig,
  StyleConfig,
  withDefaults,
  walkConfig,
  ImageConfig,
  ElementCreationMethod,
} from '../types'
import cloneDeep from 'lodash/cloneDeep'

const EMPTY_BODY = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Cuzillion Example</title>
    <!--HEAD-->
  </head>
  <body>
    <!--BODY-->
  </body>
</html>
`.trim()

function createScriptTag(config: ScriptConfig, factory: IFactory): string {
  const {inclusionType} = withDefaults(config)
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

function createStylesheetTag(config: StyleConfig, factory: IFactory): string {
  const {inclusionType} = withDefaults(config)
  const styleResource = factory.create(config)
  if (inclusionType === StylesheetInclusionType.Inline) {
    return `<style>${styleResource.body}</style>`
  } else {
    const attributes =
      inclusionType === StylesheetInclusionType.ExternalAsync
        ? `rel="preload" as="style" onload="this.rel = 'stylesheet'"`
        : 'rel="stylesheet"'
    return `<link href=${JSON.stringify(styleResource.link)} ${attributes} />`
  }
}

function createImageTag(config: ImageConfig, factory: IFactory): string {
  const {width, height} = withDefaults(config)
  const imageResource = factory.create(config)
  return `<img src=${JSON.stringify(
    imageResource.link,
  )} style="width: ${width}px; height: ${height}px" />`
}

function createHtmlChildren(children: PageConfig['body'], factory: IFactory): string {
  let html = ''
  if (!children) return html

  for (const child of children) {
    let childHtml = ''
    switch (child.type) {
      case ConfigType.Script:
        childHtml += createScriptTag(child, factory)
        break
      case ConfigType.Stylesheet:
        childHtml += createStylesheetTag(child, factory)
        break
      case ConfigType.Image:
        childHtml += createImageTag(child, factory)
        break
      case ConfigType.Text:
        childHtml += `<p>${factory.create(child).body}</p>`
        break
    }

    if (child.creationMethod === ElementCreationMethod.DocumentWrite) {
      html += `<script>document.write(\`${childHtml
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')}\`)</script>`
    } else {
      html += childHtml
    }
  }

  return html
}

function initializeIds(config: PageConfig): void {
  const state = {count: 1}
  walkConfig(config, (config) => {
    if (!config.id) config.id = `${state.count++}`
  })
}

export function createPage(
  config_: PageConfig,
  factory: IFactory,
): Omit<NetworkResourceResponse, 'link'> {
  const config = cloneDeep(config_)
  initializeIds(config)

  let body = EMPTY_BODY
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
