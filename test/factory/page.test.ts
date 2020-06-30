import {createPage, injectBytes} from '../../src/factory/page'
import {ResourceType} from '../../src/types'

describe('Page', () => {
  describe('.injectBytes', () => {
    it('should match the exact number of bytes', async () => {
      const page = createPage({type: ResourceType.Page})
      const largePage = injectBytes(page.body || '', 1024 * 1024)
      expect(largePage).toHaveLength(1024 * 1024)
    })
  })
})
