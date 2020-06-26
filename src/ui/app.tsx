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
    <div className="flex flex-row h-screen bg-gray-900 text-white font-sans leading-normal tracking-normal flex-wrap">
      <div className="w-full sm:w-1/2 h-screen flex flex-col">
        <nav id="header" class="bg-blue-900 w-full z-10 top-0 shadow">
          <div class="w-full container mx-auto flex flex-wrap items-center mt-0 pt-3 pb-3">
            <div class="w-10/12">
              <a
                class="text-gray-100 text-base pl-4 xl:text-xl no-underline hover:no-underline font-bold"
                href="#"
              >
                Cuzillion
              </a>
              <span class="text-gray-400 text-xs italic ml-2 lg:inline hidden">
                'cuz there are still a zillion pages to check in 2020
              </span>
            </div>
            <div class="w-2/12"></div>
          </div>
        </nav>
        <div class="flex flex-col items-center flex-grow p-4 shadow">
          <div class="w-full rounded bg-blue-900">
            <textarea value={config} onChange={(e) => setConfig(e.target.value)}></textarea>
          </div>
        </div>
      </div>
      <div className="w-full sm:w-1/2 h-screen bg-white">
        {parsed ? (
          <iframe
            className="h-screen"
            src={`/factory/page.html?config=${btoa(JSON.stringify(parsed))}`}
          ></iframe>
        ) : null}
      </div>
    </div>
  )
}
