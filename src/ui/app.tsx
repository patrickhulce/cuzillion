import * as preact from 'preact'
import {useState, useEffect, useRef} from 'preact/hooks'
import {ConfigType, PageConfig, EMPTY_PAGE, initializeIds} from '../types'
import {serializeConfig, deserializeConfig} from '../serialization'
import {PageConfigurator} from './configurators'
import {GitHubIcon} from './components/icons'

function readPageConfigFromHash(): PageConfig {
  const hashParams = new URLSearchParams(location.hash.replace('#', '?'))
  if (hashParams.has('config')) {
    const config = deserializeConfig(hashParams.get('config') || '')
    if (config && config.type === ConfigType.Page) return config
  }

  return EMPTY_PAGE
}

const DEFAULT_STATE = readPageConfigFromHash()

const HistorylessIframe = (props: preact.JSX.HTMLAttributes<HTMLIFrameElement>) => {
  const {src, ...attributes} = props
  const iframeRef = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    if (!iframeRef.current) return
    if (!iframeRef.current.contentWindow) return
    iframeRef.current.contentWindow.location.replace(src || 'about:blank')
  }, [src])
  return <iframe {...attributes} ref={iframeRef} src="about:blank" />
}

export const App = () => {
  const [config, setConfig] = useState<PageConfig>(DEFAULT_STATE)
  ;(window as any).__CONFIG__ = config
  initializeIds(config)
  const iframeUrl = new URL(
    `/api/page.html?config=${serializeConfig(config)}`,
    window.location.origin,
  ).href

  useEffect(() => {
    const serialized = serializeConfig(config)
    const newHash = `#config=${serialized}`
    const hashListener = () => {
      if (window.location.hash === newHash) return
      setConfig(readPageConfigFromHash())
    }

    window.location.hash = newHash
    window.addEventListener('hashchange', hashListener)
    return () => window.removeEventListener('hashchange', hashListener)
  }, [config])

  return (
    <div className="flex flex-row h-screen bg-gray-900 text-white font-sans leading-normal tracking-normal flex-wrap">
      <div className="w-full sm:w-1/2 h-screen flex flex-col overflow-auto">
        <nav id="header" className="bg-blue-900 w-full z-10 top-0 shadow">
          <div className="w-full container mx-auto flex flex-wrap items-center mt-0 pt-3 pb-3">
            <div className="w-10/12">
              <a
                className="text-gray-100 text-base pl-4 xl:text-xl no-underline hover:no-underline font-bold"
                href="#">
                Cuzillion
              </a>
              <span className="text-gray-400 text-xs italic ml-2 lg:inline hidden">
                'cuz there are still a zillion pages to check in 2020
              </span>
            </div>
            <div className="w-2/12 flex flex-row justify-end pr-2">
              <a href="https://github.com/patrickhulce/cuzillion">
                <GitHubIcon />
              </a>
            </div>
          </div>
        </nav>
        <main className="flex flex-col items-center flex-grow p-4 shadow">
          <div className="flex w-full mb-4 text-sm">
            <label className="flex flex-wrap w-1/2">
              <div className="mr-4 text-gray-400">Editor URL</div>
              <input
                className="flex-grow mr-4 rounded text-gray-800 px-1"
                type="text"
                value={window.location.href}
                onClick={e => {
                  if (!(e.target instanceof HTMLInputElement)) return
                  e.target.select()
                  e.target.value = window.location.href
                  if (!navigator.clipboard) return
                  navigator.clipboard.writeText(window.location.href)
                }}
                onKeyDown={e => e.preventDefault()}
              />
            </label>
            <label className="flex flex-wrap w-1/2">
              <div className="mr-4 text-gray-400">Page URL</div>
              <input
                className="flex-grow mr-4 rounded text-gray-800 px-1"
                type="text"
                value={iframeUrl}
                onClick={e => {
                  if (!(e.target instanceof HTMLInputElement)) return
                  e.target.select()
                  if (!navigator.clipboard) return
                  navigator.clipboard.writeText(iframeUrl)
                }}
                onKeyDown={e => e.preventDefault()}
              />
            </label>
          </div>
          <PageConfigurator config={config} setRootConfig={setConfig} configPath={[]} />
        </main>
      </div>
      <div className="w-full sm:w-1/2 h-screen bg-white">
        <HistorylessIframe
          title="Configured Cuzillion Page"
          className="w-full h-screen"
          src={iframeUrl}></HistorylessIframe>
      </div>
    </div>
  )
}
