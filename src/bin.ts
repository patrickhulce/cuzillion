import {createServer} from './server'

createServer({port: Number(process.env.PORT) || 9801, logFn: console.log}).catch((err) => {
  process.stderr.write(err.stack)
  process.exit(1)
})
