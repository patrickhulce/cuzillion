import {h, Fragment} from 'preact'
import {useState} from 'preact/hooks'

const safeParseJson = (raw: string) => {
  try {
    return JSON.parse(raw)
  } catch (err) {
    return undefined
  }
}

export const App = () => {
  const [config, setConfig] = useState('')
  const parsed = safeParseJson(config)
  return (
    <Fragment>
      <h1>Hello Cuzillion!</h1>
      <textarea value={config} onChange={(e) => setConfig(e.target.value)}></textarea>
      {parsed ? (
        <iframe src={`/factory/page.html?config=${btoa(JSON.stringify(parsed))}`}></iframe>
      ) : null}
    </Fragment>
  )
}
