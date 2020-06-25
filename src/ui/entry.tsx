import {h, render} from 'preact'

const preactRoot = document.getElementById('preact-root')
if (!preactRoot) throw new Error('Missing #preact-root')
render(<h1>Hello Cuzillion!</h1>, preactRoot)
