import prettier from 'prettier'
import {Factory} from '../../src/factory/factory'
import {createScript, injectScriptBytes} from '../../src/factory/script'
import {
  ConfigType,
  ScriptInclusionType,
  StylesheetInclusionType,
  ElementCreationMethod,
  ScriptActionType,
  ScriptConfig,
  initializeIds,
} from '../../src/types'
import * as fs from 'fs'
import * as path from 'path'

const prettierRc = JSON.parse(fs.readFileSync(path.join(__dirname, '../../.prettierrc'), 'utf8'))

describe('Script', () => {
  describe('.createScript', () => {
    it('should create a script with content', () => {
      const scriptConfig: ScriptConfig = {
        type: ConfigType.Script,
        executionDuration: 100,
        actions: [
          {
            type: ConfigType.ScriptAction,
            actionType: ScriptActionType.SetTimeout,
            onComplete: [{type: ConfigType.ScriptAction, executionDuration: 101}],
          },
          {type: ConfigType.ScriptAction, actionType: ScriptActionType.XHR},
          {
            type: ConfigType.ScriptAction,
            actionType: ScriptActionType.LoadListener,
            onComplete: [
              {
                type: ConfigType.ScriptAction,
                actionType: ScriptActionType.Fetch,
                dependent: {type: ConfigType.Text, fetchDelay: 2000},
                onComplete: [{type: ConfigType.ScriptAction, executionDuration: 100}],
              },
            ],
          },
          {
            type: ConfigType.ScriptAction,
            actionType: ScriptActionType.AddElement,
            dependent: {type: ConfigType.Image},
          },
        ],
      }

      initializeIds(scriptConfig)
      const script = createScript(scriptConfig, Factory.defaultInstance())

      const prettified = prettier.format(script.body.toString(), {...prettierRc, parser: 'babel'})
      expect(prettified).toMatchInlineSnapshot(`
        "console.log('script ID 1 started')
        function stall() {
          var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0
          var start = Date.now()

          while (Date.now() - start < ms) {}
        }
        stall(100)
        console.log('script ID 1 done')

        console.log('script action 1.2 started')
        setTimeout(() => {
          console.log('script action 1.2 onComplete started')

          console.log('script action 1.2.3 started')
          stall(101)
          console.log('script action 1.2.3 done')

          console.log('script action 1.2 onComplete done')
        }, 2000)
        console.log('script action 1.2 done')

        console.log('script action 1.4 started')
        ;(() => {
          const xhr = new XMLHttpRequest()
          xhr.open('GET', '/api/text.txt?config=eyJ0IjoidHh0In0%3D', true)
          xhr.onload = () => {}
          xhr.send()
        })()
        console.log('script action 1.4 done')

        console.log('script action 1.5 started')
        window.addEventListener('load', () => {
          console.log('script action 1.5 onComplete started')

          console.log('script action 1.5.6 started')
          fetch('/api/text.txt?config=eyJ0IjoidHh0IiwiZmV0Y2hEZWxheSI6MjAwMCwiaWQiOiI3In0%3D').then(() => {
            console.log('script action 1.5.6 onComplete started')

            console.log('script action 1.5.6.8 started')
            stall(100)
            console.log('script action 1.5.6.8 done')

            console.log('script action 1.5.6 onComplete done')
          })
          console.log('script action 1.5.6 done')

          console.log('script action 1.5 onComplete done')
        })
        console.log('script action 1.5 done')

        console.log('script action 1.9 started')
        ;(() => {
          const html =
            '\\\\n    <img src=\\"/api/image.jpg?config=eyJ0IjoiaW1nIiwiaWQiOiIxMCJ9\\" style=\\"width: 100px; height: 100px\\" />\\\\n  '
          const div = document.createElement('div')
          div.innerHTML = html
          while (div.children.length > 0) document.body.appendChild(div.children[0])
        })()
        console.log('script action 1.9 done')
        "
      `)
    })
  })

  describe('.injectScriptBytes', () => {
    it('should match the exact number of bytes', async () => {
      const script = createScript({type: ConfigType.Script}, Factory.defaultInstance())
      const largeScript = injectScriptBytes((script.body || '').toString(), 1024 * 1024)
      expect(largeScript).toHaveLength(1024 * 1024)
    })
  })
})
