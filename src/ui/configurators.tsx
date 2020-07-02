import {h, Fragment} from 'preact'
import {
  PageConfig,
  ConfigType,
  ScriptConfig,
  StyleConfig,
  StylesheetInclusionType,
  withDefaults,
  ScriptInclusionType,
  TextConfig,
  EMPTY_PAGE,
  ImageConfig,
  NetworkResourceConfig,
  CuzillionConfig,
  isNetworkResource,
  hasNonDefaultTypeSettings,
  hasNonDefaultNetworkSettings,
} from '../types'
import {ButtonGroup, Button, RadioButtonGroup} from './components/button'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import set from 'lodash/set'
import {TrashIcon, RefreshIcon, NetworkIcon, SettingsIcon} from './components/icons'
import {useState} from 'preact/hooks'
import clsx from 'clsx'

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

const NetworkResourceConfiguratorSection = (
  props: ConfigProps<Required<NetworkResourceConfig>>,
) => {
  return (
    <div className="ml-2 flex text-xs">
      <div className="">
        <input
          className="text-xs w-10 px-1 rounded text-black mr-2"
          type="text"
          value={props.config.fetchDelay}
          onChange={(e) => clickHandler({fetchDelay: Number(e.target.value)}, props)()}
        />
        ms
      </div>
    </div>
  )
}

const ConfiguratorButton = (props: {
  className?: string
  onClick?: () => void
  icon: (props: {className?: string}) => JSX.Element
  toggle?: [boolean, (b: boolean) => void]
  flagged?: boolean
}) => {
  let onClick = props.onClick
  if (!onClick && props.toggle) onClick = () => props.toggle[1](!props.toggle[0])
  if (!onClick) throw new Error('Must set either toggle or onClick')

  return (
    <div className={clsx('h-6 p-1 flex items-center rounded ', props.className)}>
      <Button
        solo
        flagged={props.toggle && props.toggle[0]}
        selected={props.toggle && props.toggle[0]}
        size="xs"
        onClick={onClick}
        color={props.flagged ? 'teal' : 'gray'}
      >
        {props.icon({className: 'h-4 w-4'})}
      </Button>
    </div>
  )
}

const Configurator = (
  props: ConfigProps<CuzillionConfig> & {name: string; children: JSX.Element | JSX.Element[]},
) => {
  const config = withDefaults(props.config)
  const hasSettings = hasNonDefaultTypeSettings(config)
  const hasNetworkSettings = hasNonDefaultNetworkSettings(config)
  const [isVisible, setIsVisible] = useState(hasSettings)
  const [isNetVisible, setIsNetVisible] = useState(hasNetworkSettings)
  return (
    <div className="rounded bg-blue-900 p-2 mb-2">
      <div className="w-full flex items-center">
        <div className="flex-grow">{props.name}</div>
        <div className="w-auto h-6 flex items-center">
          {isNetworkResource(config) ? (
            <ConfiguratorButton
              icon={NetworkIcon}
              toggle={[isNetVisible, setIsNetVisible]}
              flagged={hasNetworkSettings}
            />
          ) : null}
          <ConfiguratorButton
            icon={SettingsIcon}
            toggle={[isVisible, setIsVisible]}
            flagged={hasSettings}
          />
          <ConfiguratorButton icon={TrashIcon} onClick={() => clickHandler(null, props)()} />
        </div>
      </div>
      {isVisible || isNetVisible ? (
        <div className="w-full">
          {isVisible ? props.children : null}
          {isNetVisible && isNetworkResource(config) ? (
            <NetworkResourceConfiguratorSection {...props} config={config} />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
const ScriptConfigurator = (props: ConfigProps<ScriptConfig>) => {
  const config = withDefaults(props.config)

  return (
    <Configurator name="Script" {...props}>
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
      <div className="ml-2 flex text-xs">
        <div className="">
          <input
            className="text-xs w-10 px-1 rounded text-black mr-2"
            type="text"
            value={props.config.executionDuration}
            onChange={(e) => clickHandler({executionDuration: Number(e.target.value)}, props)()}
          />
          ms
        </div>
      </div>
    </Configurator>
  )
}

const StyleConfigurator = (props: ConfigProps<StyleConfig>) => {
  const config = withDefaults(props.config)
  return (
    <Configurator name="Style" {...props}>
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
    </Configurator>
  )
}

const ImageConfigurator = (props: ConfigProps<ImageConfig>) => {
  const config = withDefaults(props.config)
  return (
    <Configurator name="Image" {...props}>
      <input
        className="text-black text-xs rounded px-1 w-12"
        type="text"
        value={config.width}
        onChange={(e) => clickHandler({width: Number(e.target.value)}, props)()}
      />
      <span className="text-xs mx-1">x</span>
      <input
        className="text-black text-xs rounded px-1 w-12"
        type="text"
        value={config.height}
        onChange={(e) => clickHandler({height: Number(e.target.value)}, props)()}
      />
    </Configurator>
  )
}

const TextConfigurator = (props: ConfigProps<TextConfig>) => {
  const config = withDefaults(props.config)
  return (
    <Configurator name="Text" {...props}>
      <input
        className="text-black rounded px-1"
        type="text"
        value={config.textContent}
        onChange={(e) => clickHandler({textContent: e.target.value}, props)()}
      />
    </Configurator>
  )
}

const ChildConfigurator = (props: {config: PageChildConfig} & Omit<ConfigProps, 'config'>) => {
  switch (props.config.type) {
    case ConfigType.Script:
      return <ScriptConfigurator {...props} config={props.config} />
    case ConfigType.Stylesheet:
      return <StyleConfigurator {...props} config={props.config} />
    case ConfigType.Image:
      return <ImageConfigurator {...props} config={props.config} />
    case ConfigType.Text:
      return <TextConfigurator {...props} config={props.config} />
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
        <Button onClick={clickHandler(ConfigType.Script)}>Script</Button>
        <Button onClick={clickHandler(ConfigType.Stylesheet)}>Stylesheet</Button>
        {props.label === 'body' ? (
          <Button onClick={clickHandler(ConfigType.Image)}>Image</Button>
        ) : null}
        {props.label === 'body' ? (
          <Button onClick={clickHandler(ConfigType.Text)}>Text</Button>
        ) : null}
      </ButtonGroup>
    </div>
  )
}

export const PageConfigurator = (props: Omit<ConfigProps, 'rootConfig'>) => {
  const headItems = props.config.head || []
  const bodyItems = props.config.body || []

  return (
    <div className="w-full rounded bg-blue-900 p-2">
      <div className="flex pb-2">
        <div className="flex-grow">Page Configuration</div>
        <div className="text-black">
          <Button solo onClick={() => props.setRootConfig(EMPTY_PAGE)}>
            <RefreshIcon />
          </Button>
        </div>
      </div>
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
