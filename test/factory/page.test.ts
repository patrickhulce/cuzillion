import {Factory} from '../../src/factory/factory'
import {createPage, injectPageBytes} from '../../src/factory/page'
import {
  ConfigType,
  ScriptInclusionType,
  StylesheetInclusionType,
  ElementCreationMethod,
} from '../../src/types'

describe('Page', () => {
  describe('.createPage', () => {
    it('should create a page with content', () => {
      const page = createPage(
        {
          type: ConfigType.Page,
          head: [
            {
              type: ConfigType.Script,
              inclusionType: ScriptInclusionType.Inline,
              executionDuration: 50,
            },
            {type: ConfigType.Script, inclusionType: ScriptInclusionType.ExternalAsync},
            {type: ConfigType.Stylesheet, inclusionType: StylesheetInclusionType.Inline},
            {type: ConfigType.Stylesheet, inclusionType: StylesheetInclusionType.External},
            {type: ConfigType.Stylesheet, inclusionType: StylesheetInclusionType.ExternalAsync},
          ],
          body: [
            {type: ConfigType.Script, inclusionType: ScriptInclusionType.ExternalDefer},
            {type: ConfigType.Page, body: [{type: ConfigType.Text, textContent: 'Frames dawg'}]},
            {type: ConfigType.Text, textContent: "I am the walrus, Goo goo g'joob"},
          ],
        },
        Factory.defaultInstance(),
      )

      const [head, body] = page.body.toString().split('<body>')
      expect(head.match(/<style/g)).toHaveLength(1)
      expect(head.match(/<link/g)).toHaveLength(2)
      expect(head.match(/<script/g)).toHaveLength(2)
      expect(body.match(/<script/g)).toHaveLength(1)
      expect(body.match(/<iframe/g)).toHaveLength(1)
      expect(head).toContain('stall(50)')
      expect(body).toContain('I am the walrus')
      expect(body).not.toContain('Frames dawg')
    })

    it('should create elements using document.write', () => {
      const page = createPage(
        {
          type: ConfigType.Page,
          head: [
            {
              type: ConfigType.Script,
              creationMethod: ElementCreationMethod.DocumentWrite,
              inclusionType: ScriptInclusionType.Inline,
              executionDuration: 50,
            },
            {
              type: ConfigType.Stylesheet,
              creationMethod: ElementCreationMethod.DocumentWrite,
              inclusionType: StylesheetInclusionType.Inline,
            },
          ],
          body: [
            {type: ConfigType.Image, creationMethod: ElementCreationMethod.DocumentWrite},
            {type: ConfigType.Text, creationMethod: ElementCreationMethod.DocumentWrite},
          ],
        },
        Factory.defaultInstance(),
      )

      expect(page.body).toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html lang=\\"en\\">
          <head>
            <title>Cuzillion Example</title>
            <script>document.write(\`<script>
            console.log('script ID 4 started');
            function stall() {
          var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var start = Date.now();

          while (Date.now() - start < ms) {
            ;
          }
        };
            stall(50);
            console.log('script ID 4 done');
          <\` + \`/script>\`)</script><script>document.write(\`<style>html, body { height: 100vh; margin: 0; box-sizing: border-box; }
        body { padding: 10px; }</style>\`)</script>
          </head>
          <body>
            <script>document.write(\`<img src=\\"/api/image.jpg?config=eyJ0IjoiaW1nIiwiY3JlYXRpb25NZXRob2QiOiJkb2N3cml0ZSIsImlkIjoiMiJ9\\" style=\\"width: 100px; height: 100px\\" />\`)</script><script>document.write(\`<p>Hello, Cuzillion!</p>\`)</script>
          </body>
        </html>"
      `)
    })
  })

  describe('.injectPageBytes', () => {
    it('should match the exact number of bytes', async () => {
      const page = createPage({type: ConfigType.Page}, Factory.defaultInstance())
      const largePage = injectPageBytes((page.body || '').toString(), 1024 * 1024)
      expect(largePage).toHaveLength(1024 * 1024)
    })
  })
})
