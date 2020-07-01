import {h, Fragment} from 'preact'
import {
  PageConfig,
  ResourceType,
  ScriptConfig,
  StyleConfig,
  StylesheetInclusionType,
  withDefaults,
  ScriptInclusionType,
} from '../types'
import {ButtonGroup, Button, RadioButtonGroup} from './components/button'
import cloneDeep from 'lodash-es/cloneDeep'
import get from 'lodash-es/get'
import set from 'lodash-es/set'
import {TrashIcon} from './components/icons'

interface ConfigProps<T = PageConfig> {
  config: T
  rootConfig: PageConfig
  setRootConfig: (config: PageConfig) => void
  configPath: string[]
}

type PageChildConfig = PageConfig['body'][0]

function clickHandler<T = PageConfig>(
  config: Partial<T> | null,
  props: Omit<ConfigProps, 'config'>,
): () => void {
  return () => {
    const cloned = cloneDeep(props.rootConfig)
    if (config === null) {
      const parent = get(cloned, props.configPath.slice(0, props.configPath.length - 1))
      const childKey = props.configPath[props.configPath.length - 1]
      if (Array.isArray(parent)) {
        parent.splice(Number(childKey), 1)
      } else {
        delete parent[childKey]
      }
    } else {
      set(cloned, props.configPath, {...get(cloned, props.configPath), ...config})
    }

    props.setRootConfig(cloned)
  }
}

const ScriptConfigurator = (props: ConfigProps<ScriptConfig>) => {
  const config = withDefaults(props.config)
  return (
    <div className="rounded bg-blue-900 p-2 mb-2">
      <div className="w-full flex items-center">
        <div className="w-full sm:w-auto sm:mr-4">Script</div>
        <div className="w-full sm:w-auto sm:mr-4">
          <RadioButtonGroup
            size="xs"
            color="teal"
            value={config.inclusionType}
            options={[
              {label: 'External', value: ScriptInclusionType.External},
              {label: 'Defer', value: ScriptInclusionType.ExternalDefer},
              {label: 'Async', value: ScriptInclusionType.ExternalAsync},
              {label: 'Inline', value: ScriptInclusionType.Inline},
            ]}
            setValue={(inclusionType) => clickHandler({inclusionType}, props)()}
          />
        </div>
        <div className="w-full sm:w-auto sm:mr-4 flex items-center">
          <Button solo onClick={() => clickHandler(null, props)()} size="xs">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const StyleConfigurator = (props: ConfigProps<StyleConfig>) => {
  const config = withDefaults(props.config)
  return (
    <div className="rounded bg-blue-900 p-2 mb-2">
      <div className="w-full flex items-center">
        <div className="w-full sm:w-auto sm:mr-4">Style</div>
        <div className="w-full sm:w-auto sm:mr-4">
          <RadioButtonGroup
            size="xs"
            color="teal"
            value={config.inclusionType}
            options={[
              {label: 'External', value: StylesheetInclusionType.External},
              {label: 'Async', value: StylesheetInclusionType.ExternalAsync},
              {label: 'Inline', value: StylesheetInclusionType.Inline},
            ]}
            setValue={(inclusionType) => clickHandler({inclusionType}, props)()}
          />
        </div>
        <div className="w-full sm:w-auto sm:mr-4 flex items-center">
          <Button solo onClick={() => clickHandler(null, props)()} size="xs">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const ChildConfigurator = (props: {config: PageChildConfig} & Omit<ConfigProps, 'config'>) => {
  switch (props.config.type) {
    case ResourceType.Script:
      return <ScriptConfigurator {...props} config={props.config} />
    case ResourceType.Stylesheet:
      return <StyleConfigurator {...props} config={props.config} />
    default:
      return <div>Unsupported</div>
  }
}

const PageSubtarget = (
  props: {label: 'head' | 'body'; items: Array<PageChildConfig>} & Omit<
    ConfigProps,
    'config' | 'configPath'
  >,
) => {
  const clickHandler = (type: PageChildConfig['type']) => () =>
    props.setRootConfig({
      ...props.rootConfig,
      [props.label]: props.items.concat({type}),
    })

  return (
    <div className="p-2 bg-blue-800 rounded mb-2">
      <div className="font-mono mb-2">{props.label}</div>
      {props.items.map((item, idx) => (
        <ChildConfigurator
          key={`${item.type}-${item.id}-${idx}`}
          {...props}
          config={item}
          configPath={[props.label, idx.toString()]}
        />
      ))}
      <ButtonGroup className="py-2 text-sm">
        <Button onClick={clickHandler(ResourceType.Script)}>Script</Button>
        <Button onClick={clickHandler(ResourceType.Stylesheet)}>Stylesheet</Button>
      </ButtonGroup>
    </div>
  )
}

export const PageConfigurator = (props: Omit<ConfigProps, 'rootConfig'>) => {
  const headItems = props.config.head || []
  const bodyItems = props.config.body || []

  return (
    <div className="w-full rounded bg-blue-900 p-2">
      <div className="pb-2">Page Configuration</div>
      <PageSubtarget
        label="head"
        items={headItems}
        rootConfig={props.config}
        setRootConfig={props.setRootConfig}
      />
      <PageSubtarget
        label="body"
        items={bodyItems}
        rootConfig={props.config}
        setRootConfig={props.setRootConfig}
      />
    </div>
  )
}
