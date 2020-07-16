import {NowRequest, NowResponse} from '@vercel/node'
import {Factory} from '../src/factory/factory'
import {respondWithFactory} from '../src/server'

const factory = Factory.defaultInstance()
const handler = respondWithFactory(factory.create, factory.injectBytes)
export default (req: NowRequest, res: NowResponse) => handler(req, res)
