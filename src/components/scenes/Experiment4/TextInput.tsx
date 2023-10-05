import { PixiComponent } from '@pixi/react'
import PixiTextInput from 'pixi-text-input'
import { DisplayObject, Container as PixiContainer } from 'pixi.js'

export interface TextInputProps extends Partial<PixiContainer> {
  substituteText?: boolean
  placeholder?: string
  placeholderColor?: number | string
  overwriteProps?: boolean
  ignoreEvents?: boolean
  text?: string
  maxLength?: number
  restrict?: RegExp | string
  disabled?: boolean
  onKeydown?: (keycode: number) => void
  onKeyup?: (keycode: number) => void
  onChange?: (text: string) => void
  onFocus?: () => void
  onBlur?: () => void
}
export default PixiComponent<TextInputProps, DisplayObject>('TextInput', {
  create: (props: TextInputProps) => {
    // instantiate something and return it.
    // for instance:
    const input = new PixiTextInput({
      input: {
        fontSize: '36px',
        padding: '12px',
        width: '500px',
        color: '#26272E',
      },
      box: {
        default: { fill: 0xe8e9f3, rounded: 12, stroke: { color: 0xcbcee0, width: 3 } },
        focused: { fill: 0xe1e3ee, rounded: 12, stroke: { color: 0xabafc6, width: 3 } },
        disabled: { fill: 0xdbdbdb, rounded: 12 },
      },
    })
    input.placeholder = 'Enter your Text...'
    input.x = 0
    input.y = 0
    // input.pivot.x = input.width / 2
    // input.pivot.y = input.height / 2
    applyProps(input, {}, props)
    return input
  },
  // didMount: (instance, parent) => {
  //   // apply custom logic on mount
  // },
  // willUnmount: (instance, parent) => {
  //   // clean up before removal
  // },
  applyProps: (instance, oldProps, newProps) => {
    // props changed
    // apply logic to the instance
    // console.log('applyProps  > instance, oldProps, newProps:', instance, oldProps, newProps)
    // const check = DisplayObject.prototype.isPrototypeOf(instance)
    // console.log(' > check:', check)
    // debugger
    applyProps(instance, oldProps, newProps)
  },
  config: {
    // destroy instance on unmount?
    // default true
    destroy: true,

    /// destroy its children on unmount?
    // default true
    destroyChildren: true,
  },
})

function applyProps(
  instance: typeof PixiTextInput,
  oldProps: Readonly<TextInputProps>,
  newProps: Readonly<TextInputProps>
) {
  let changed = false
  // update event handlers
  if (!newProps.ignoreEvents) {
    const hasRemoveListener = typeof instance.removeListener === 'function'
    const hasOn = typeof instance.on === 'function'
    for (let i = 0; i < eventHandlers.length; i++) {
      const evt = eventHandlers[i] as keyof TextInputProps
      if (evt && oldProps[evt] !== newProps[evt]) {
        changed = true
        const removeFn = oldProps[evt]
        if (typeof removeFn === 'function' && hasRemoveListener) {
          instance.removeListener(
            MAP_EVENTKEY_TO_EVENT[evt as keyof typeof MAP_EVENTKEY_TO_EVENT],
            removeFn
          )
        }
        const addFn = newProps[evt]
        if (typeof addFn === 'function' && hasOn) {
          instance.on(MAP_EVENTKEY_TO_EVENT[evt as keyof typeof MAP_EVENTKEY_TO_EVENT], addFn)
        }
      }
    }
  }
  const newPropKeys = Object.keys(newProps || {})

  // hard overwrite all props? can speed up performance
  if (newProps.overwriteProps) {
    for (let _i = 0; _i < newPropKeys.length; _i++) {
      const p = newPropKeys[_i] as keyof TextInputProps
      if (oldProps[p] !== newProps[p]) {
        changed = true
        setValue(instance, p, newProps[p])
      }
    }

    // TODO: previously this returned nothing ie. falsy, should we explicitly return false here instead or was it always
    // a subtle bug, test the intention
    return changed
  }
  const filterProps = (newPropKey: string) => newPropKey
  const props = newPropKeys.filter(filterProps)
  for (let _i2 = 0; _i2 < props.length; _i2++) {
    const prop = props[_i2] as keyof TextInputProps | undefined
    if (prop) {
      const value = newProps[prop]!
      if (newProps[prop] !== oldProps[prop]) {
        changed = true
      }
      if (value !== undefined) {
        // set value if defined
        setValue(instance, prop, value)
      } else if (prop in PROPS_DISPLAY_OBJECT) {
        // is a default value, use that
        console.warn(
          'setting default value: '
            .concat(prop, ', from: ')
            .concat(instance[prop], ' to: ')
            .concat(value, ' for'),
          instance
        )
        changed = true
        setValue(instance, prop, PROPS_DISPLAY_OBJECT[prop as keyof typeof PROPS_DISPLAY_OBJECT])
      } else {
        console.warn(
          'ignoring prop: '
            .concat(prop, ', from ')
            .concat(instance[prop], ' to ')
            .concat(value, ' for'),
          instance
        )
      }
    }
  }
  return changed
}

function setValue(instance: typeof PixiTextInput, prop: string, value: unknown) {
  instance[prop] = value
}

const MAP_EVENTKEY_TO_EVENT = {
  onKeydown: 'keydown',
  onKeyup: 'keyup',
  onChange: 'input',
  onFocus: 'focus',
  onBlur: 'blur',
} as const

const PROPS_DISPLAY_OBJECT = {
  alpha: 1,
  buttonMode: false,
  cacheAsBitmap: false,
  cursor: null,
  filterArea: null,
  filters: null,
  hitArea: null,
  interactive: false,
  mask: null,
  pivot: 0,
  position: 0,
  renderable: true,
  rotation: 0,
  scale: 1,
  skew: 0,
  transform: null,
  visible: true,
  x: 0,
  y: 0,
} as const
const eventHandlers = ['onKeydown', 'onKeyup', 'onChange', 'onFocus', 'onBlur'] as const
