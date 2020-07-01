import {h, Fragment} from 'preact'
import {useState, useEffect} from 'preact/hooks'
import {ResourceType, PageConfig} from '../types'
import {serializeConfig, deserializeConfig} from '../serialization'
import {PageConfigurator} from './configurators'

function getDefaultPageConfig(): PageConfig {
  const hashParams = new URLSearchParams(location.hash.replace('#', '?'))
  if (hashParams.has('config')) {
    const config = deserializeConfig(hashParams.get('config'))
    if (config && config.type === ResourceType.Page) return config
  }

  return {type: ResourceType.Page}
}

const DEFAULT_STATE = getDefaultPageConfig()

export const App = () => {
  const [config, setConfig] = useState<PageConfig>(DEFAULT_STATE)

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
          <PageConfigurator config={config} setRootConfig={setConfig} configPath={[]} />
        </div>
      </div>
      <div className="w-full sm:w-1/2 h-screen bg-white">
        <iframe
          className="h-screen"
          src={`/factory/page.html?config=${serializeConfig(config)}`}
        ></iframe>
      </div>
    </div>
  )
}
