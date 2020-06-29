import * as path from 'path'
import express from 'express'
import {createPage} from './factory/page'
import {NetworkResourceResponse, CuzillionConfig} from './types'
import {wait} from './utils'
import {deserializeConfig, serializeConfig} from './serialization'

const staticDir = path.join(__dirname, 'ui')
const indexHtml = path.join(staticDir, 'index.html')

function respondWithFactory(
  contentType: string,
  factory: (config: CuzillionConfig) => NetworkResourceResponse,
) {
  return async (req: express.Request, res: express.Response) => {
    if (!req.query) return res.sendStatus(500)
    if (typeof req.query.config !== 'string') return res.sendStatus(500)

    try {
      const config = deserializeConfig(req.query.config)
      if (!config) throw new Error(`No valid config`)
      if (config.fetchDelay) await wait(config.fetchDelay)
      if (config.redirectCount) {
        const newConfig = {...config, redirectCount: config.redirectCount - 1}
        const newUrl = new URL(req.originalUrl)
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

      res.set('content-type', contentType)
      res.send(response.body)
    } catch (err) {
      process.stderr.write(`Error processing config: ${err.stack}\n`)
      res.sendStatus(500)
    }
  }
}

const app = express()
app.get('/', (req, res) => res.sendFile(indexHtml))
app.use('/ui/', express.static(staticDir))
app.use('/factory/page.html', respondWithFactory('text/html', createPage))

app.listen(9801, () => process.stdout.write(`Server listening on http://localhost:9801/\n`))
