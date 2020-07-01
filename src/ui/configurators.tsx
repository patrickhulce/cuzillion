import {h, Fragment} from 'preact'
import {PageConfig, ResourceType, ScriptConfig, StyleConfig} from '../types'
import {ButtonGroup, Button} from './components/button'

interface ConfigProps<T = PageConfig> {
  config: T
  rootConfig: PageConfig
  setRootConfig: (config: PageConfig) => void
  configPath: string[]
}

type PageChildConfig = PageConfig['body'][0]

const ScriptConfigurator = (props: ConfigProps<ScriptConfig>) => {
  return (
    <div className="rounded bg-blue-900 p-2 mb-2">
      <span>Script</span>
      <div>type:</div>
    </div>
  )
}

const StyleConfigurator = (props: ConfigProps<StyleConfig>) => {
  return (
    <div className="rounded bg-blue-900 p-2 mb-2">
      <span>Style</span>
      <div>type:</div>
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
      <div className="p-2">Page Configuration</div>
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
