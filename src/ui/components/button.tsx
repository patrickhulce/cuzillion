import {h} from 'preact'
import clsx from 'clsx'

interface ButtonProps {
  children: string | JSX.Element
  solo?: boolean
  color?: 'blue' | 'gray'
  className?: string
  onClick: () => void
}

const CLASSES_FOR_COLOR = {
  blue: 'bg-blue-500 hover:bg-blue-700 text-white',
  gray: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
}

export const Button = (props: ButtonProps) => {
  const {color = 'gray'} = props
  const className = clsx('font-bold font-sm py-1 px-2', props.className, {
    [CLASSES_FOR_COLOR.blue]: color === 'blue',
    [CLASSES_FOR_COLOR.gray]: color === 'gray',
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
