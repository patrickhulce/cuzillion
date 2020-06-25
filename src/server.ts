import * as path from 'path'
import express from 'express'
import {createPage} from './factory/page'
import {NetworkResourceResponse} from './types'
import {wait} from './utils'

const staticDir = path.join(__dirname, 'ui')
const indexHtml = path.join(staticDir, 'index.html')

function respondWithFactory<TConfig>(
  contentType: string,
  factory: (config: TConfig) => NetworkResourceResponse,
) {
  return async (req: express.Request, res: express.Response) => {
    if (!req.query) return res.sendStatus(500)
    if (typeof req.query.config !== 'string') return res.sendStatus(500)

    const response = factory(JSON.parse(Buffer.from(req.query.config, 'base64').toString()))
    if (response.delay) await wait(response.delay)
    if (response.statusCode) res.status(response.statusCode)
    if (response.headers) {
      for (const [key, value] of Object.entries(response.headers)) {
        res.set(key, value)
      }
    }

    res.set('content-type', contentType)
    res.send(response.body)
  }
}

const app = express()
app.get('/', (req, res) => res.sendFile(indexHtml))
app.use('/ui/', express.static(staticDir))
app.use('/factory/page.html', respondWithFactory('text/html', createPage))

app.listen(9801, () => process.stdout.write(`Server listening on http://localhost:9801/\n`))
