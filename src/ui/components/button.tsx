import * as preact from 'preact'
import clsx from 'clsx'

interface ButtonProps {
  children: string | JSX.Element
  solo?: boolean
  flagged?: boolean
  selected?: boolean
  size?: 'lg' | 'sm' | 'xs'
  color?: 'blue' | 'gray' | 'teal'
  className?: string
  title: string
  onClick: () => void
}

const CLASSES_FOR_COLOR = {
  blue: 'hover:bg-blue-700 text-white',
  teal: 'hover:bg-teal-700 text-white',
  gray: 'hover:bg-gray-300 text-gray-800',
}
const UNSELECTED_CLASSES_FOR_COLOR = {
  blue: 'bg-blue-800',
  teal: 'bg-teal-800',
  gray: 'bg-gray-400',
}
const SELECTED_CLASSES_FOR_COLOR = {
  blue: 'bg-blue-600',
  teal: 'bg-teal-600',
  gray: 'bg-gray-200',
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
    [UNSELECTED_CLASSES_FOR_COLOR.blue]: color === 'blue' && !props.selected,
    [UNSELECTED_CLASSES_FOR_COLOR.teal]: color === 'teal' && !props.selected,
    [UNSELECTED_CLASSES_FOR_COLOR.gray]: color === 'gray' && !props.selected,
    [SELECTED_CLASSES_FOR_COLOR.blue]: color === 'blue' && props.selected,
    [SELECTED_CLASSES_FOR_COLOR.teal]: color === 'teal' && props.selected,
    [SELECTED_CLASSES_FOR_COLOR.gray]: color === 'gray' && props.selected,
    rounded: props.solo,
    'shadow-outline': props.flagged,
    'first:rounded-l last:rounded-r': !props.solo,
  })

  return (
    <button title={props.title} className={className} onClick={props.onClick}>
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
            title={option.label}
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
