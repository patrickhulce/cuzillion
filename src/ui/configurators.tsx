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
} from '../types'
import {ButtonGroup, Button, RadioButtonGroup} from './components/button'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import set from 'lodash/set'
import {TrashIcon, RefreshIcon, NetworkIcon} from './components/icons'
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
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className={clsx('w-full sm:w-auto h-6 p-1 rounded mr-4 flex items-center', {
        'bg-blue-800': isVisible,
      })}
    >
      <Button solo onClick={() => setIsVisible(!isVisible)} size="xs">
        <NetworkIcon className="h-4 w-4" />
      </Button>
      {isVisible ? (
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
      ) : null}
    </div>
  )
}

const ScriptConfigurator = (props: ConfigProps<ScriptConfig>) => {
  const config = withDefaults(props.config)
  return (
    <div className="rounded bg-blue-900 p-2 mb-2">
      <div className="w-full flex items-center">
        <div className="w-full sm:w-auto mr-4">Script</div>
        <div className="w-full sm:w-auto mr-4">
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
        <NetworkResourceConfiguratorSection {...props} config={config} />
        <div className="w-full sm:w-auto mr-4 flex items-center">
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
        <div className="w-full sm:w-auto mr-4">Style</div>
        <div className="w-full sm:w-auto mr-4">
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
        <NetworkResourceConfiguratorSection {...props} config={config} />
        <div className="w-full sm:w-auto mr-4 flex items-center">
          <Button solo onClick={() => clickHandler(null, props)()} size="xs">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const ImageConfigurator = (props: ConfigProps<ImageConfig>) => {
  const config = withDefaults(props.config)
  return (
    <div className="rounded bg-blue-900 p-2 mb-2">
      <div className="w-full flex items-center">
        <div className="w-full sm:w-auto mr-4">Image</div>
        <div className="w-full sm:w-auto mr-4">
          <input
            className="text-black rounded px-1 w-12"
            type="text"
            value={config.width}
            onChange={(e) => clickHandler({width: Number(e.target.value)}, props)()}
          />
          <span className="mx-1">x</span>
          <input
            className="text-black rounded px-1 w-12"
            type="text"
            value={config.height}
            onChange={(e) => clickHandler({height: Number(e.target.value)}, props)()}
          />
        </div>
        <NetworkResourceConfiguratorSection {...props} config={config} />
        <div className="w-full sm:w-auto mr-4 flex items-center">
          <Button solo onClick={() => clickHandler(null, props)()} size="xs">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const TextConfigurator = (props: ConfigProps<TextConfig>) => {
  const config = withDefaults(props.config)
  return (
    <div className="rounded bg-blue-900 p-2 mb-2">
      <div className="w-full flex items-center">
        <div className="w-full sm:w-auto mr-4">Text</div>
        <div className="w-full sm:w-auto mr-4">
          <input
            className="text-black rounded px-1"
            type="text"
            value={config.textContent}
            onChange={(e) => clickHandler({textContent: e.target.value}, props)()}
          />
        </div>
        <div className="w-full sm:w-auto mr-4 flex items-center">
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
