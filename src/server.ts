import * as path from 'path'
import express from 'express'
import {NetworkResourceResponse, NetworkResourceConfig, isNetworkResource} from './types'
import {wait} from './utils'
import {deserializeConfig, serializeConfig} from './serialization'
import debug from 'debug'
import compression from 'compression'
import {Factory} from './factory/factory'
import {NowRequest, NowResponse} from '@vercel/node'

const log = debug('cuzillion:server')

const staticDir = path.join(__dirname, 'ui')
const indexHtml = path.join(staticDir, 'index.html')

export function respondWithFactory(
  factory: (config: NetworkResourceConfig) => NetworkResourceResponse,
  injectBytes: (
    config: NetworkResourceConfig,
    body: Buffer | string | undefined,
  ) => Buffer | string | undefined,
) {
  return async (req: express.Request | NowRequest, res: express.Response | NowResponse) => {
    if (!req.query) return res.status(500).send('No Query')
    if (typeof req.query.config !== 'string') return res.status(500).send('No Config')

    try {
      const config = deserializeConfig(req.query.config)
      log(`received request with config`, config)
      if (!config) throw new Error(`No valid config`)
      if (!isNetworkResource(config)) throw new Error('Config not for network resource')
      if (config.fetchDelay) await wait(config.fetchDelay)
      if (config.redirectCount) {
        const originalUrl = 'originalUrl' in req ? req.originalUrl : req.url || '/'
        const newConfig = {...config, redirectCount: config.redirectCount - 1}
        const newUrl = new URL(originalUrl, 'http://localhost')
        newUrl.searchParams.set('config', serializeConfig(newConfig))
        res.setHeader('Location', `${newUrl.pathname}${newUrl.search}`)
        return res.status(302).send('')
      }

      if (config.statusCode) res.status(config.statusCode)

      const response = factory(config)
      if (response.headers) {
        for (const [key, value] of Object.entries(response.headers)) {
          res.setHeader(key, value)
        }
      }

      res.send(injectBytes(config, response.body))
    } catch (err) {
      log(`Error processing config: ${err.stack}\n`)
      res.status(500).send('Internal Error')
    }
  }
}

export function createServer(options: {
  port?: number
  logFn?: (...args: any[]) => void
}): Promise<{port: number; close: () => Promise<void>}> {
  const {port: targetPort = 9801, logFn = log} = options
  const factory = Factory.defaultInstance()
  const app = express()
  app.get('/', (req, res) => res.sendFile(indexHtml))
  app.use('/ui/', compression())
  app.use('/ui/', express.static(staticDir))
  app.use('/api/page.html', respondWithFactory(factory.create, factory.injectBytes))
  app.use('/api/script.js', respondWithFactory(factory.create, factory.injectBytes))
  app.use('/api/text.txt', respondWithFactory(factory.create, factory.injectBytes))
  app.use('/api/style.css', respondWithFactory(factory.create, factory.injectBytes))
  app.use('/api/image.jpg', respondWithFactory(factory.create, factory.injectBytes))

  return new Promise((resolve, reject) => {
    const server = app.listen(targetPort, () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        return reject(new Error(`Invalid address ${address}`))
      }

      const port = address.port
      logFn(`Server listening on http://localhost:${port}/\n`)
      resolve({port, close: () => new Promise(r => server.close(() => r()))})
    })
  })
}
