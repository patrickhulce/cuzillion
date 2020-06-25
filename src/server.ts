import * as path from 'path'
import express from 'express'

const staticDir = path.join(__dirname, 'ui')
const indexHtml = path.join(staticDir, 'index.html')

const app = express()
app.get('/', (req, res) => res.sendFile(indexHtml))
app.use('/ui/', express.static(staticDir))

app.listen(9801, () => process.stdout.write(`Server listening on http://localhost:9801/\n`))
