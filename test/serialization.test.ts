import * as serialization from '../src/serialization'
import {withDefaults, ConfigType} from '../src/types'

describe('serialization', () => {
  it('should round-trip correctly', () => {
    const config = withDefaults({
      type: ConfigType.Page,
      body: [withDefaults({type: ConfigType.Script})],
    })

    const serialized = serialization.serializeConfig(config)
    expect(typeof serialized).toBe('string')
    const deserialized = serialization.deserializeConfig(serialized)
    expect(deserialized).toEqual(config)
  })

  describe('.serializeConfig', () => {
    it('should elide default data', () => {
      const serializedA = serialization.serializeConfig({type: ConfigType.Page, head: []})
      const serializedB = serialization.serializeConfig({type: ConfigType.Page})
      expect(serializedA).toEqual(serializedB)
      const deserialized = serialization.deserializeConfig(serializedA)
      const reserialized = serialization.serializeConfig(deserialized)
      expect(reserialized).toEqual(serializedA)
    })
  })

  describe('.deserializeConfig', () => {
    it('should rehydrate default data', () => {
      const serialized = serialization.serializeConfig({type: ConfigType.Page})
      const deserialized = serialization.deserializeConfig(serialized)
      expect(deserialized).toEqual({
        type: ConfigType.Page,
        head: [],
        body: [],
        creationMethod: 'html',
        id: '',
        originPreference: '/',
        fetchDelay: 0,
        redirectCount: 0,
        sizeInBytes: 0,
        statusCode: 200,
      })
    })
  })
})
