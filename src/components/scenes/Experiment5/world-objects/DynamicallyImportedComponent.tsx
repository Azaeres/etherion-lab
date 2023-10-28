'use client'
import { ComponentType, lazy, Suspense } from 'react'
// import Curtain from '../Curtain/Curtain';
import { WorldObjectProps } from '../database/WorldObject'

type Module = Promise<{
  default: ComponentType<WorldObjectProps<object>>
}>

// const style = new TextStyle({
//   dropShadow: true,
//   dropShadowAlpha: 0.8,
//   fill: '0xffffff',
//   fontSize: 54,
// })

// const anchor = { x: 0.5, y: 0.5 }

export default function DynamicallyImportedComponent(
  module: Module,
  props: WorldObjectProps<object | undefined>
) {
  const Component = lazy(() => module)
  // Delayed dynamic import for testing suspense loading view.
  // const SceneComponent = lazy(() => {
  //   return new Promise<{
  //     default: ComponentType<unknown>
  //   }>((resolve) => {
  //     setTimeout(() => {
  //       resolve(module)
  //     }, 3000)
  //   })
  // })
  return (
    <Suspense>
      <Component {...props} />
    </Suspense>
  )
}

// fallback={
//   <>
//     {/* <Text
//       text="Loading..."
//       style={style}
//       anchor={anchor}
//       x={OPTIONS.width / 2}
//       y={OPTIONS.height / 2}
//     /> */}
//     {/* <Curtain /> */}
//   </>
// }
