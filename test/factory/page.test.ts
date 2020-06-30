import {createPage, injectPageBytes} from '../../src/factory/page'
import {ResourceType} from '../../src/types'

describe('Page', () => {
  describe('.injectPageBytes', () => {
    it('should match the exact number of bytes', async () => {
      const page = createPage({type: ResourceType.Page})
      const largePage = injectPageBytes(page.body || '', 1024 * 1024)
      expect(largePage).toHaveLength(1024 * 1024)
    })
  })
})
