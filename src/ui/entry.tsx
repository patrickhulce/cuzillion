import {h, render} from 'preact'
import {App} from './app'

const preactRoot = document.getElementById('preact-root')
if (!preactRoot) throw new Error('Missing #preact-root')
render(<App />, preactRoot)
