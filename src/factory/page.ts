import {PageConfig, NetworkResourceResponse} from '../types'

export function createPage(config: PageConfig): NetworkResourceResponse {
  return {
    body: `
    <!DOCTYPE html>
<html lang="en">
<body>
<h1>Configuration was:</h1>
<pre>${JSON.stringify(config)}</pre>
    `,
  }
}
