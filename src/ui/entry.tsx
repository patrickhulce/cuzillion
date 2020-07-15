import * as preact from 'preact'
import {App} from './app'

const preactRoot = document.getElementById('preact-root')
if (!preactRoot) throw new Error('Missing #preact-root')
preact.render(<App />, preactRoot)
