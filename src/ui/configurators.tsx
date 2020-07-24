import * as preact from 'preact'
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
  ElementCreationMethod,
  ScriptActionConfig,
  ScriptActionType,
  OriginPreference,
} from '../types'
import {ButtonGroup, Button, RadioButtonGroup, SelectButton} from './components/button'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import set from 'lodash/set'
import isEqual from 'lodash/isEqual'
import minBy from 'lodash/minBy'
import {TrashIcon, RefreshIcon, NetworkIcon, SettingsIcon} from './components/icons'
import {useState} from 'preact/hooks'
import clsx from 'clsx'
import {PreactFragment} from './components/fragment'

interface ConfigProps<T = PageConfig> {
  config: T
  rootConfig: PageConfig
  setRootConfig: (config: PageConfig) => void
  configPath: string[]
}

type PageChildConfig = Required<PageConfig>['body'][0]

function clickHandler<T = PageConfig>(
  config: Partial<T> | null,
  props: Omit<ConfigProps, 'config'>,
): () => void {
  return () => {
    const parentPath = props.configPath.slice(0, props.configPath.length - 1)
    const cloned = cloneDeep(props.rootConfig)
    if (config === null) {
      const parent = get(cloned, parentPath)
      const childKey = props.configPath[props.configPath.length - 1]
      if (Array.isArray(parent)) {
        parent.splice(Number(childKey), 1)
      } else {
        delete parent[childKey]
      }
    } else {
      set(
        cloned,
        props.configPath,
        Array.isArray(config) ? config : {...get(cloned, props.configPath), ...config},
      )
    }

    props.setRootConfig(cloned)
  }
}

function dragHandler(
  props: ConfigProps<CuzillionConfig>,
): (evt: preact.JSX.TargetedDragEvent<HTMLDivElement>) => void {
  return evt => {
    if (props.config.type === ConfigType.Page || props.config.type === ConfigType.ScriptAction)
      return

    const allDraggables: HTMLElement[] = Array.from(document.querySelectorAll('div[draggable]'))
    const positions = allDraggables.map(el => {
      const rect = el.getBoundingClientRect()
      return {el, position: (rect.top + rect.bottom) / 2, rect}
    })
    const closest = minBy(positions, ({position}) => Math.abs(position - evt.clientY))
    if (!closest) return

    const isBeforeClosest = closest.position > evt.clientY
    const closestConfigPath = (closest.el.dataset.configpath || '').split(',')
    if (!closestConfigPath.length) return
    if (isEqual(props.configPath, closestConfigPath)) return

    const closestConfig = get(props.rootConfig, closestConfigPath)
    if (!closestConfig) return
    const parentArray: Required<PageConfig>['body'] = get(props.rootConfig, [props.configPath[0]])
    const targetParentArray: Required<PageConfig>['body'] = get(props.rootConfig, [
      closestConfigPath[0],
    ])

    const updatedParentArray = parentArray.filter(item => item.id !== props.config.id)
    const updatedTargetParentArray =
      parentArray === targetParentArray ? updatedParentArray : targetParentArray.slice()
    const indexOfTargetConfig = updatedTargetParentArray.findIndex(
      item => item.id === closestConfig.id,
    )
    if (indexOfTargetConfig === -1) return

    updatedTargetParentArray.splice(
      isBeforeClosest ? indexOfTargetConfig : indexOfTargetConfig + 1,
      0,
      props.config,
    )

    if (isEqual(parentArray, updatedParentArray)) return
    const rootConfig = {...props.rootConfig}
    set(rootConfig, [props.configPath[0]], updatedParentArray)
    set(rootConfig, [closestConfigPath[0]], updatedTargetParentArray)
    props.setRootConfig(rootConfig)
  }
}

function getParentConfig(
  rootConfig: PageConfig,
  configPath: string[],
): [CuzillionConfig, string[]] {
  let targetPath = configPath.slice(0, configPath.length - 1)
  while (targetPath.length && Array.isArray(get(rootConfig, targetPath))) targetPath.pop()
  if (!targetPath.length) return [rootConfig, []]
  return [get(rootConfig, targetPath), targetPath]
}

function getConfigDepth(rootConfig: PageConfig, fullPath: string[]): number {
  let depth = 0
  let configPath = fullPath
  while (configPath.length) {
    configPath = getParentConfig(rootConfig, configPath)[1]
    depth++
  }

  return depth
}

const OriginPreferenceLabels: Record<OriginPreference, string> = {
  [OriginPreference.SameOrigin]: 'Same Origin',
  [OriginPreference.Primary]: 'Primary',
  [OriginPreference.Secondary]: 'Secondary',
  [OriginPreference.Tertiary]: 'Tertiary',
  [OriginPreference.Quaternary]: 'Quaternary',
}

const NetworkResourceConfiguratorSection = (
  props: ConfigProps<Required<NetworkResourceConfig>>,
) => {
  return (
    <PreactFragment>
      <ConfiguratorOption label="Fetch Delay" lgTargetSize="1/4">
        <div className="text-xs">
          <input
            className="text-xs w-10 px-1 rounded text-black mr-2"
            type="text"
            value={props.config.fetchDelay}
            onChange={(e: any) => clickHandler({fetchDelay: Number(e.target.value)}, props)()}
          />
          ms
        </div>
      </ConfiguratorOption>
      <ConfiguratorOption label="Redirects" lgTargetSize="1/4">
        <div className="text-xs">
          <input
            className="text-xs w-10 px-1 rounded text-black mr-2"
            type="text"
            value={props.config.redirectCount}
            onChange={(e: any) => clickHandler({redirectCount: Number(e.target.value)}, props)()}
          />
        </div>
      </ConfiguratorOption>
      <ConfiguratorOption label="Status Code" lgTargetSize="1/4">
        <div className="text-xs">
          <input
            className="text-xs w-10 px-1 rounded text-black mr-2"
            type="text"
            value={props.config.statusCode}
            onChange={(e: any) => clickHandler({statusCode: Number(e.target.value)}, props)()}
          />
        </div>
      </ConfiguratorOption>
      <ConfiguratorOption label="Minimum Size" lgTargetSize="1/4">
        <div className="text-xs">
          <input
            className="text-xs w-10 px-1 rounded text-black mr-2"
            type="text"
            value={Math.ceil(props.config.sizeInBytes / 1024)}
            onChange={(e: any) =>
              clickHandler({sizeInBytes: Number(e.target.value) * 1024}, props)()
            }
          />
          KiB
        </div>
      </ConfiguratorOption>
      <ConfiguratorOption label="Origin Preference" lgTargetSize="1/2">
        <SelectButton
          size="xs"
          value={props.config.originPreference}
          options={Object.keys(OriginPreferenceLabels).map(originPref_ => {
            const originPref = originPref_ as OriginPreference
            return {label: OriginPreferenceLabels[originPref], value: originPref}
          })}
          setValue={originPreference => clickHandler({originPreference}, props)()}
        />
      </ConfiguratorOption>
    </PreactFragment>
  )
}

const ConfiguratorButton = (props: {
  className?: string
  onClick?: () => void
  title: string
  icon: (props: {className?: string}) => preact.JSX.Element
  toggle?: [boolean, (b: boolean) => void]
  flagged?: boolean
}) => {
  let onClick = props.onClick
  const toggle = props.toggle
  if (!onClick && toggle) onClick = () => toggle[1](!toggle[0])
  if (!onClick) throw new Error('Must set either toggle or onClick')

  return (
    <div className={clsx('h-6 p-1 flex items-center rounded ', props.className)}>
      <Button
        solo
        title={props.title}
        flagged={props.toggle && props.toggle[0]}
        selected={props.toggle && props.toggle[0]}
        size="xs"
        onClick={onClick}
        color={props.flagged ? 'teal' : 'gray'}>
        {props.icon({className: 'h-4 w-4'})}
      </Button>
    </div>
  )
}

const Configurator = (
  props: ConfigProps<CuzillionConfig> & {
    name: string
    children: preact.JSX.Element | preact.JSX.Element[]
  },
) => {
  const config = withDefaults(props.config)
  const hasSettings = hasNonDefaultTypeSettings({...config, id: ''})
  const hasNetworkSettings = hasNonDefaultNetworkSettings({...config, id: ''})
  const [isVisible, setIsVisible] = useState(hasSettings)
  const [isNetVisible, setIsNetVisible] = useState(hasNetworkSettings)
  const [parentConfig] = getParentConfig(props.rootConfig, props.configPath)
  const configDepth = getConfigDepth(props.rootConfig, props.configPath)

  // only allow first-level children to be draggable
  const draggable = configDepth === 1

  return (
    <div
      className={clsx('w-full rounded p-2 mb-2', {
        'cursor-move': draggable,
        'bg-blue-800': configDepth % 2 === 0,
        'bg-blue-900': configDepth % 2 === 1,
      })}
      draggable={draggable}
      data-configpath={props.configPath.join(',')}
      onDrag={dragHandler(props)}>
      <div className="w-full flex items-center">
        <div className="flex-grow">{props.name}</div>
        <div className="w-auto h-6 flex items-center">
          <ConfiguratorButton
            title={`Toggle ${props.config.type} Settings`}
            icon={SettingsIcon}
            toggle={[isVisible, setIsVisible]}
            flagged={hasSettings}
          />
          {isNetworkResource(config, parentConfig) ? (
            <ConfiguratorButton
              title="Toggle Network Settings"
              icon={NetworkIcon}
              toggle={[isNetVisible, setIsNetVisible]}
              flagged={hasNetworkSettings}
            />
          ) : null}
          <ConfiguratorButton
            title="Delete"
            icon={TrashIcon}
            onClick={() => clickHandler(null, props)()}
          />
        </div>
      </div>
      {isVisible || isNetVisible ? (
        <div className="w-full flex flex-wrap">
          {isVisible ? props.children : null}
          {isNetVisible && isNetworkResource(config) ? (
            <NetworkResourceConfiguratorSection {...props} config={config} />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

const ConfiguratorOption = (props: {
  label: string
  children: preact.JSX.Element | preact.JSX.Element[]
  lgTargetSize?: 'full' | '1/2' | '1/4'
}) => {
  const {lgTargetSize = '1/2'} = props
  let width = `w-${lgTargetSize}`
  if (lgTargetSize === '1/2') width = `w-full lg:w-1/2`
  if (lgTargetSize === '1/4') width = `w-full sm:w-1/2 lg:w-1/4`
  return (
    <label className={clsx('my-2', width)}>
      <div className="w-full text-xs text-gray-500 mb-1 mr-4 border-b border-blue-800">
        {props.label}
      </div>
      <div className="w-full flex truncate">{props.children}</div>
    </label>
  )
}

const ScriptConfigurator = (props: ConfigProps<ScriptConfig>) => {
  const config = withDefaults(props.config)

  return (
    <Configurator name="Script" {...props}>
      <ConfiguratorOption label="Inclusion Method">
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
          setValue={inclusionType => clickHandler({inclusionType}, props)()}
        />
      </ConfiguratorOption>
      <ConfiguratorOption label="Execution Duration" lgTargetSize="1/4">
        <div className="text-xs">
          <input
            className="text-xs w-10 px-1 rounded text-black mr-2"
            type="text"
            value={config.executionDuration}
            onChange={(e: any) =>
              clickHandler({executionDuration: Number(e.target.value)}, props)()
            }
          />
          ms
        </div>
      </ConfiguratorOption>
      <ConfiguratorOption label="Element Creation" lgTargetSize="1/4">
        <RadioButtonGroup
          size="xs"
          color="teal"
          value={config.creationMethod}
          options={[
            {label: 'HTML', value: ElementCreationMethod.HTML},
            {label: 'document.write', value: ElementCreationMethod.DocumentWrite},
          ]}
          setValue={creationMethod => clickHandler({creationMethod}, props)()}
        />
      </ConfiguratorOption>
      <ScriptActionListConfigurator
        {...props}
        label="Actions"
        actionsList={config.actions}
        configPath={[...props.configPath, 'actions']}
      />
    </Configurator>
  )
}

const ScriptActionLabels: Record<ScriptActionType, string> = {
  [ScriptActionType.Stall]: 'Stall',
  [ScriptActionType.XHR]: 'XHR',
  [ScriptActionType.SyncXHR]: 'Sync XHR',
  [ScriptActionType.Fetch]: 'Fetch',
  [ScriptActionType.SetTimeout]: 'Set Timeout',
  [ScriptActionType.LoadListener]: 'onLoad',
  [ScriptActionType.DCLListener]: 'onDCL',
  [ScriptActionType.AddElement]: 'Add Element',
}

const ScriptActionListConfigurator = (
  props: {label: string; actionsList: Array<ScriptActionConfig>} & Omit<ConfigProps, 'config'>,
) => {
  const [actionTypeToAdd, setActionTypeToAdd] = useState(ScriptActionType.Stall)
  return (
    <ConfiguratorOption label={props.label} lgTargetSize="full">
      <div className="w-full">
        {props.actionsList.map((action, idx) => (
          <ScriptActionConfigurator
            key={action.id}
            rootConfig={props.rootConfig}
            setRootConfig={props.setRootConfig}
            config={action}
            configPath={[...props.configPath, `${idx}`]}
          />
        ))}
        <div className="flex flex-row">
          <SelectButton
            size="xs"
            value={actionTypeToAdd}
            options={Object.keys(ScriptActionLabels).map(actionType_ => {
              const actionType = actionType_ as ScriptActionType
              return {label: ScriptActionLabels[actionType], value: actionType}
            })}
            setValue={setActionTypeToAdd}
          />
          <div className="w-1"></div>
          <Button
            size="xs"
            solo
            title={`Add an action action`}
            onClick={clickHandler(
              [...props.actionsList, {type: ConfigType.ScriptAction, actionType: actionTypeToAdd}],
              props,
            )}>
            Add
          </Button>
        </div>
      </div>
    </ConfiguratorOption>
  )
}

const ScriptActionConfigurator = (props: ConfigProps<ScriptActionConfig>) => {
  const config = withDefaults(props.config)
  return (
    <Configurator name={ScriptActionLabels[config.actionType]} {...props}>
      {config.actionType === ScriptActionType.Stall ? (
        <ConfiguratorOption label="Execution Duration" lgTargetSize="1/4">
          <div className="text-xs">
            <input
              className="text-xs w-10 px-1 rounded text-black mr-2"
              type="text"
              value={config.executionDuration}
              onChange={(e: any) =>
                clickHandler({executionDuration: Number(e.target.value)}, props)()
              }
            />
            ms
          </div>
        </ConfiguratorOption>
      ) : (
        <PreactFragment />
      )}
      {config.actionType === ScriptActionType.SetTimeout ? (
        <ConfiguratorOption label="Timeout Delay" lgTargetSize="1/4">
          <div className="text-xs">
            <input
              className="text-xs w-10 px-1 rounded text-black mr-2"
              type="text"
              value={config.timeoutDelay}
              onChange={(e: any) => clickHandler({timeoutDelay: Number(e.target.value)}, props)()}
            />
            ms
          </div>
        </ConfiguratorOption>
      ) : (
        <PreactFragment />
      )}
      {config.actionType === ScriptActionType.AddElement ||
      config.actionType === ScriptActionType.Fetch ||
      config.actionType === ScriptActionType.XHR ||
      config.actionType === ScriptActionType.SyncXHR ? (
        <ConfiguratorOption
          label={config.actionType === ScriptActionType.AddElement ? 'Element' : 'Request'}
          lgTargetSize="full">
          <ChildConfigurator
            {...props}
            config={config.dependent}
            configPath={[...props.configPath, 'dependent']}
          />
        </ConfiguratorOption>
      ) : (
        <PreactFragment />
      )}
      <ScriptActionListConfigurator
        {...props}
        label="On Complete"
        actionsList={config.onComplete}
        configPath={[...props.configPath, 'onComplete']}
      />
    </Configurator>
  )
}

const StyleConfigurator = (props: ConfigProps<StyleConfig>) => {
  const config = withDefaults(props.config)
  return (
    <Configurator name="Style" {...props}>
      <ConfiguratorOption label="Inclusion Method">
        <RadioButtonGroup
          size="xs"
          color="teal"
          value={config.inclusionType}
          options={[
            {label: 'External', value: StylesheetInclusionType.External},
            {label: 'Async', value: StylesheetInclusionType.ExternalAsync},
            {label: 'Inline', value: StylesheetInclusionType.Inline},
          ]}
          setValue={inclusionType => clickHandler({inclusionType}, props)()}
        />
      </ConfiguratorOption>
      <ConfiguratorOption label="Element Creation" lgTargetSize="1/4">
        <RadioButtonGroup
          size="xs"
          color="teal"
          value={config.creationMethod}
          options={[
            {label: 'HTML', value: ElementCreationMethod.HTML},
            {label: 'document.write', value: ElementCreationMethod.DocumentWrite},
          ]}
          setValue={creationMethod => clickHandler({creationMethod}, props)()}
        />
      </ConfiguratorOption>
    </Configurator>
  )
}

const ImageConfigurator = (props: ConfigProps<ImageConfig>) => {
  const config = withDefaults(props.config)
  return (
    <Configurator name="Image" {...props}>
      <ConfiguratorOption label="Dimensions" lgTargetSize="1/4">
        <input
          className="text-black text-xs rounded px-1 w-10"
          type="text"
          value={config.width}
          onChange={(e: any) => clickHandler({width: Number(e.target.value)}, props)()}
        />
        <span className="text-xs mx-1">x</span>
        <input
          className="text-black text-xs rounded px-1 w-10"
          type="text"
          value={config.height}
          onChange={(e: any) => clickHandler({height: Number(e.target.value)}, props)()}
        />
      </ConfiguratorOption>
      <ConfiguratorOption label="Element Creation" lgTargetSize="1/4">
        <RadioButtonGroup
          size="xs"
          color="teal"
          value={config.creationMethod}
          options={[
            {label: 'HTML', value: ElementCreationMethod.HTML},
            {label: 'document.write', value: ElementCreationMethod.DocumentWrite},
          ]}
          setValue={creationMethod => clickHandler({creationMethod}, props)()}
        />
      </ConfiguratorOption>
    </Configurator>
  )
}

const TextConfigurator = (props: ConfigProps<TextConfig>) => {
  const config = withDefaults(props.config)
  return (
    <Configurator name="Text" {...props}>
      <ConfiguratorOption label="Text Content" lgTargetSize="full">
        <input
          className="w-full text-black rounded px-1"
          type="text"
          value={config.textContent}
          onChange={(e: any) => clickHandler({textContent: e.target.value}, props)()}
        />
      </ConfiguratorOption>
      <ConfiguratorOption label="Element Creation" lgTargetSize="1/4">
        <RadioButtonGroup
          size="xs"
          color="teal"
          value={config.creationMethod}
          options={[
            {label: 'HTML', value: ElementCreationMethod.HTML},
            {label: 'document.write', value: ElementCreationMethod.DocumentWrite},
          ]}
          setValue={creationMethod => clickHandler({creationMethod}, props)()}
        />
      </ConfiguratorOption>
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
    <div
      className="p-2 bg-blue-800 rounded mb-2"
      onDragOver={e => e.preventDefault()} // allow other elements to be dropped onto this element
    >
      <div className="font-mono mb-2">{props.label}</div>
      {props.items.map((item, idx) => (
        <ChildConfigurator
          key={`${item.type}-${item.id}`}
          {...props}
          config={item}
          configPath={[props.label, idx.toString()]}
        />
      ))}
      <ButtonGroup className="py-2 text-sm">
        <Button title="Add a script element" onClick={clickHandler(ConfigType.Script)}>
          Script
        </Button>
        <Button title="Add a stylesheet element" onClick={clickHandler(ConfigType.Stylesheet)}>
          Stylesheet
        </Button>
        {props.label === 'body' ? (
          <Button title="Add an image element" onClick={clickHandler(ConfigType.Image)}>
            Image
          </Button>
        ) : (
          <PreactFragment />
        )}
        {props.label === 'body' ? (
          <Button title="Add a text element" onClick={clickHandler(ConfigType.Text)}>
            Text
          </Button>
        ) : (
          <PreactFragment />
        )}
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
          <Button title="Reset page to empty" solo onClick={() => props.setRootConfig(EMPTY_PAGE)}>
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
