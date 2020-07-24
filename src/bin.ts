import {createServer} from './server'

const portPrimary = Number(process.env.PORT) || 9801
const portSecondary = Number(process.env.PORT_SECONDARY) || 9802
const availableOrigins = [`http://localhost:${portPrimary}`, `http://localhost:${portSecondary}`]

createServer({port: portPrimary, logFn: console.log, availableOrigins}).catch(err => {
  process.stderr.write(err.stack)
  process.exit(1)
})

createServer({port: portSecondary, logFn: console.log, availableOrigins}).catch(err => {
  process.stderr.write(err.stack)
  process.exit(1)
})
