import {PageConfig, NetworkResourceResponse} from '../types'

export function createPage(config: PageConfig): NetworkResourceResponse {
  return {
    config,
    body: `
    <!DOCTYPE html>
<html lang="en">
<body>
<h1>Configuration was:</h1>
<pre>${JSON.stringify(config)}</pre>
</body>
</html>
    `,
  }
}

export function injectBytes(body: string, totalByteTarget: number): string {
  const currentBytes = body.length
  const comment = `<!--  -->`
  const bytesNeeded = totalByteTarget - currentBytes - comment.length
  const injection = comment.replace('  ', ` ${'0'.repeat(bytesNeeded)} `)
  return body.replace('</body>', `${injection}</body>`)
}
