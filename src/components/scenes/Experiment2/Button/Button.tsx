// import * as PIXI from 'pixi.js'
// import { PixiComponent, applyDefaultProps } from '@pixi/react'
// import { FancyButton } from '@pixi/ui'
// import { PropsWithChildren, ReactElement } from 'react'

// export interface ButtonProps {
//   children?: ReactElement<PIXI.Container<PIXI.DisplayObject>>
// }

// export default PixiComponent<ButtonProps, ButtonContainer>('Button', {
//   create: ({ children }) => {
//     // instantiate something and return it.
//     // for instance:
//     const view = new PIXI.Graphics().beginFill(0xffffff).drawRoundedRect(0, 0, 100, 50, 15)
//     const button = new FancyButton(view)
//     button.onPress.connect(() => console.log('onPress'))
//     return button
//   },
//   didMount: (instance, parent) => {
//     // apply custom logic on mount
//   },
//   willUnmount: (instance, parent) => {
//     // clean up before removal
//   },
//   applyProps: (instance, oldProps, newProps) => {
//     // const { view, ...oldP } = oldProps
//     // const { view, ...newP } = newProps

//     // apply rest props to PIXI.Text
//     // applyDefaultProps(instance, oldProps, newProps)

//     // set new count
//     // instance.view = count.toString()
//   },
//   config: {
//     // destroy instance on unmount?
//     // default true
//     destroy: true,

//     /// destroy its children on unmount?
//     // default true
//     destroyChildren: true,
//   },
// })
