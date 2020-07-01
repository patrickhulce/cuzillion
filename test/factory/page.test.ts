import {Factory} from '../../src/factory/factory'
import {createPage, injectPageBytes} from '../../src/factory/page'
import {ResourceType, ScriptInclusionType, StylesheetInclusionType} from '../../src/types'

describe('Page', () => {
  describe('.createPage', () => {
    it('should create a page with content', () => {
      const page = createPage(
        {
          type: ResourceType.Page,
          head: [
            {
              type: ResourceType.Script,
              inclusionType: ScriptInclusionType.Inline,
              executionDuration: 50,
            },
            {type: ResourceType.Script, inclusionType: ScriptInclusionType.ExternalAsync},
            {type: ResourceType.Stylesheet, inclusionType: StylesheetInclusionType.Inline},
            {type: ResourceType.Stylesheet, inclusionType: StylesheetInclusionType.External},
            {type: ResourceType.Stylesheet, inclusionType: StylesheetInclusionType.ExternalAsync},
          ],
          body: [
            {type: ResourceType.Script, inclusionType: ScriptInclusionType.ExternalDefer},
            {type: ResourceType.Text, textContent: "I am the walrus, Goo goo g'joob"},
          ],
        },
        Factory.defaultInstance(),
      )

      const [head, body] = page.body.split('<body>')
      expect(head.match(/<style/g)).toHaveLength(1)
      expect(head.match(/<link/g)).toHaveLength(2)
      expect(head.match(/<script/g)).toHaveLength(2)
      expect(body.match(/<script/g)).toHaveLength(1)
      expect(head).toContain('stall(50)')
      expect(body).toContain('I am the walrus')
    })
  })

  describe('.injectPageBytes', () => {
    it('should match the exact number of bytes', async () => {
      const page = createPage({type: ResourceType.Page}, Factory.defaultInstance())
      const largePage = injectPageBytes(page.body || '', 1024 * 1024)
      expect(largePage).toHaveLength(1024 * 1024)
    })
  })
})
