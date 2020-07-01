import {h} from 'preact'
import clsx from 'clsx'

interface ButtonProps {
  children: string | JSX.Element
  solo?: boolean
  selected?: boolean
  size?: 'lg' | 'sm' | 'xs'
  color?: 'blue' | 'gray' | 'teal'
  className?: string
  onClick: () => void
}

const CLASSES_FOR_COLOR = {
  blue: 'bg-blue-500 hover:bg-blue-700 text-white',
  teal: 'bg-teal-500 hover:bg-teal-700 text-white',
  gray: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
}
const SELECTED_CLASSES_FOR_COLOR = {
  blue: 'bg-blue-800',
  teal: 'bg-teal-800',
  gray: 'bg-gray-500',
}
const CLASSES_FOR_SIZE = {
  lg: 'text-lg py-1 px-2',
  sm: 'text-sm py-1 px-2',
  xs: 'text-xs px-1',
}

export const Button = (props: ButtonProps) => {
  const {color = 'gray', size = 'sm'} = props
  const className = clsx('font-bold', props.className, {
    [CLASSES_FOR_COLOR.blue]: color === 'blue',
    [CLASSES_FOR_COLOR.teal]: color === 'teal',
    [CLASSES_FOR_COLOR.gray]: color === 'gray',
    [CLASSES_FOR_SIZE.lg]: size === 'lg',
    [CLASSES_FOR_SIZE.sm]: size === 'sm',
    [CLASSES_FOR_SIZE.xs]: size === 'xs',
    [SELECTED_CLASSES_FOR_COLOR.blue]: color === 'blue' && props.selected,
    [SELECTED_CLASSES_FOR_COLOR.teal]: color === 'teal' && props.selected,
    [SELECTED_CLASSES_FOR_COLOR.gray]: color === 'gray' && props.selected,
    rounded: props.solo,
    'first:rounded-l last:rounded-r': !props.solo,
  })

  return (
    <button className={className} onClick={props.onClick}>
      {props.children}
    </button>
  )
}

export const ButtonGroup = (props: {children: JSX.Element[]; className?: string}) => {
  return <div className={clsx('inline-flex', props.className)}>{props.children}</div>
}

export function RadioButtonGroup<T>(props: {
  options: Array<{label: string; value: T}>
  value: T
  setValue: (next: T) => void
  size?: ButtonProps['size']
  color?: ButtonProps['color']
}): JSX.Element {
  return (
    <ButtonGroup>
      {props.options.map((option, idx) => {
        return (
          <Button
            size={props.size}
            color={props.color}
            selected={props.value === option.value}
            onClick={() => props.setValue(option.value)}
          >
            {option.label}
          </Button>
        )
      })}
    </ButtonGroup>
  )
}
