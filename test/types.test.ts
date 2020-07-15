import * as serialization from '../src/serialization'
import {ConfigType, initializeIds, CuzillionConfig} from '../src/types'

describe('initializeIds', () => {
  it('should initialize ids on empty config', () => {
    const config: CuzillionConfig = {
      type: ConfigType.Page,
      body: [{type: ConfigType.Script}],
    }

    initializeIds(config)
    expect(config).toMatchObject({
      id: `1`,
      body: [{id: `2`}],
    })
  })

  it('should initialize ids on partially filled config', () => {
    const config: CuzillionConfig = {
      id: '2',
      type: ConfigType.Page,
      body: [{type: ConfigType.Script}, {type: ConfigType.Stylesheet, id: '3'}],
    }

    initializeIds(config)
    expect(config).toMatchObject({
      id: `2`,
      body: [{type: ConfigType.Script, id: `4`}, {id: `3`}],
    })
  })
})
