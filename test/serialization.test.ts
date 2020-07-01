import * as serialization from '../src/serialization'
import {withDefaults, ResourceType} from '../src/types'

describe('serialization', () => {
  it('should round-trip correctly', () => {
    const config = withDefaults({
      type: ResourceType.Page,
      body: [withDefaults({type: ResourceType.Script})],
    })

    const serialized = serialization.serializeConfig(config)
    expect(typeof serialized).toBe('string')
    const deserialized = serialization.deserializeConfig(serialized)
    expect(deserialized).toEqual(config)
  })

  describe('.serializeConfig', () => {
    it('should elide default data', () => {
      const serializedA = serialization.serializeConfig({type: ResourceType.Page, head: []})
      const serializedB = serialization.serializeConfig({type: ResourceType.Page})
      expect(serializedA).toEqual(serializedB)
    })
  })

  describe('.deserializeConfig', () => {
    it('should rehydrate default data', () => {
      const serialized = serialization.serializeConfig({type: ResourceType.Page})
      const deserialized = serialization.deserializeConfig(serialized)
      expect(deserialized).toEqual({
        type: ResourceType.Page,
        head: [],
        body: [],
        id: '',
        fetchDelay: 0,
        redirectCount: 0,
        sizeInBytes: 0,
        statusCode: 200,
      })
    })
  })
})
