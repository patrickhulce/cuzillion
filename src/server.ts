import * as path from 'path'
import express from 'express'
import {createPage, injectBytes} from './factory/page'
import {NetworkResourceResponse, CuzillionConfig} from './types'
import {wait} from './utils'
import {deserializeConfig, serializeConfig} from './serialization'
import debug from 'debug'

const log = debug('cuzillion:server')

const staticDir = path.join(__dirname, 'ui')
const indexHtml = path.join(staticDir, 'index.html')

function respondWithFactory(
  contentType: string,
  factory: (config: CuzillionConfig) => NetworkResourceResponse,
  injectBytes: (body: string, targetBytes: number) => string,
) {
  return async (req: express.Request, res: express.Response) => {
    if (!req.query) return res.sendStatus(500)
    if (typeof req.query.config !== 'string') return res.sendStatus(500)

    try {
      const config = deserializeConfig(req.query.config)
      log(`received request with config`, config)
      if (!config) throw new Error(`No valid config`)
      if (config.fetchDelay) await wait(config.fetchDelay)
      if (config.redirectCount) {
        const newConfig = {...config, redirectCount: config.redirectCount - 1}
        const newUrl = new URL(req.originalUrl, 'http://localhost')
        newUrl.searchParams.set('config', serializeConfig(newConfig))
        return res.redirect(302, `${newUrl.pathname}${newUrl.search}`)
      }

      if (config.statusCode) res.status(config.statusCode)

      const response = factory(config)
      if (response.headers) {
        for (const [key, value] of Object.entries(response.headers)) {
          res.set(key, value)
        }
      }

      let body = response.body
      if (body && config.sizeInBytes) body = injectBytes(body, config.sizeInBytes)
      res.set('content-type', contentType)
      res.send(body)
    } catch (err) {
      log(`Error processing config: ${err.stack}\n`)
      res.sendStatus(500)
    }
  }
}

export function createServer(options: {
  port?: number
  logFn?: (...args: any[]) => void
}): Promise<{port: number; close: () => Promise<void>}> {
  const {port: targetPort = 9801, logFn = log} = options
  const app = express()
  app.get('/', (req, res) => res.sendFile(indexHtml))
  app.use('/ui/', express.static(staticDir))
  app.use('/factory/page.html', respondWithFactory('text/html', createPage, injectBytes))

  return new Promise((resolve, reject) => {
    const server = app.listen(targetPort, () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        return reject(new Error(`Invalid address ${address}`))
      }

      const port = address.port
      logFn(`Server listening on http://localhost:${port}/\n`)
      resolve({port, close: () => new Promise((r) => server.close(() => r()))})
    })
  })
}
