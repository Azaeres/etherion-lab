import { lazy } from 'react'

// Delayed dynamic import for testing suspense loading view.
// import { ComponentType, lazy } from 'react'
// type Module = Promise<{
//   default: ComponentType<unknown>
// }>
// const delayTest = () => {
//   return new Promise<{ default: ComponentType<unknown> }>((resolve) => {
//     setTimeout(() => {
//       const Component = import('src/components/scenes/Experiment2')
//       resolve(Component)
//     }, 3000)
//   })
// }

export const sceneMap = {
  experiment1: lazy(() => import('src/components/scenes/Experiment1')),
  experiment2: lazy(() => import('src/components/scenes/Experiment2')),
  experiment3: lazy(() => import('src/components/scenes/Experiment3')),
  experiment4: lazy(() => import('src/components/scenes/Experiment4')),
  experiment5: lazy(() => import('src/components/scenes/Experiment5')),
} as const

export type SceneId = keyof typeof sceneMap | '/'
const scenes = Object.keys(sceneMap) as ReadonlyArray<SceneId>
export default scenes
