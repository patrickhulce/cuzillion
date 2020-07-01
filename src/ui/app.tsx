import {h, Fragment} from 'preact'
import {useState, useEffect} from 'preact/hooks'
import {ConfigType, PageConfig} from '../types'
import {serializeConfig, deserializeConfig} from '../serialization'
import {PageConfigurator} from './configurators'

const EMPTY_PAGE: PageConfig = {type: ConfigType.Page, body: [{type: ConfigType.Text}]}

function getDefaultPageConfig(): PageConfig {
  const hashParams = new URLSearchParams(location.hash.replace('#', '?'))
  if (hashParams.has('config')) {
    const config = deserializeConfig(hashParams.get('config'))
    if (config && config.type === ConfigType.Page) return config
  }

  return EMPTY_PAGE
}

const DEFAULT_STATE = getDefaultPageConfig()

export const App = () => {
  const [config, setConfig] = useState<PageConfig>(DEFAULT_STATE)
  const iframeUrl = new URL(
    `/factory/page.html?config=${serializeConfig(config)}`,
    window.location.origin,
  ).href

  useEffect(() => {
    window.location.hash = `#config=${serializeConfig(config)}`
  }, [config])

  return (
    <div className="flex flex-row h-screen bg-gray-900 text-white font-sans leading-normal tracking-normal flex-wrap">
      <div className="w-full sm:w-1/2 h-screen flex flex-col">
        <nav id="header" className="bg-blue-900 w-full z-10 top-0 shadow">
          <div className="w-full container mx-auto flex flex-wrap items-center mt-0 pt-3 pb-3">
            <div className="w-10/12">
              <a
                className="text-gray-100 text-base pl-4 xl:text-xl no-underline hover:no-underline font-bold"
                href="#"
              >
                Cuzillion
              </a>
              <span className="text-gray-400 text-xs italic ml-2 lg:inline hidden">
                'cuz there are still a zillion pages to check in 2020
              </span>
            </div>
            <div className="w-2/12"></div>
          </div>
        </nav>
        <div className="flex flex-col items-center flex-grow p-4 shadow">
          <div className="flex w-full mb-4 text-sm">
            <div className="flex flex-wrap w-1/2">
              <div className="mr-4 text-gray-400">Editor URL</div>
              <input
                className="opacity-75 flex-grow mr-4 rounded text-gray-800 px-1"
                type="text"
                value={window.location.href}
                onClick={(e) => {
                  if (!(e.target instanceof HTMLInputElement)) return
                  e.target.select()
                  if (!navigator.clipboard) return
                  navigator.clipboard.writeText(window.location.href)
                }}
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
            <div className="flex flex-wrap w-1/2">
              <div className="mr-4 text-gray-400">Page URL</div>
              <input
                className="opacity-75 flex-grow mr-4 rounded text-gray-800 px-1"
                type="text"
                value={iframeUrl}
                onClick={(e) => {
                  if (!(e.target instanceof HTMLInputElement)) return
                  e.target.select()
                  if (!navigator.clipboard) return
                  navigator.clipboard.writeText(iframeUrl)
                }}
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
          </div>
          <PageConfigurator config={config} setRootConfig={setConfig} configPath={[]} />
        </div>
      </div>
      <div className="w-full sm:w-1/2 h-screen bg-white">
        <iframe className="h-screen" src={iframeUrl}></iframe>
      </div>
    </div>
  )
}
