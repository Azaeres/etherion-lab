'use client'
import { ComponentType, lazy, Suspense } from 'react'
// import Curtain from '../Curtain/Curtain';
import { Text } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import { OPTIONS } from 'src/components/PixiStage'

type Module = Promise<{
  default: ComponentType<unknown>
}>

export default function DynamicallyImportedArea(module: Module) {
  const AreaComponent = lazy(() => module)
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
    <Suspense
      fallback={
        <>
          <Text
            text="Loading..."
            style={
              new TextStyle({
                dropShadow: true,
                dropShadowAlpha: 0.8,
                fill: '0xffffff',
                fontSize: 54,
              })
            }
            anchor={{ x: 0.5, y: 0.5 }}
            x={OPTIONS.width / 2}
            y={OPTIONS.height / 2}
          />
          {/* <Curtain /> */}
        </>
      }
    >
      <AreaComponent />
    </Suspense>
  )
}
