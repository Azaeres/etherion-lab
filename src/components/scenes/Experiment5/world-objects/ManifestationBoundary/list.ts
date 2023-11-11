import { lazy } from 'react'

// Delayed dynamic import for testing suspense loading view.
// import { ComponentType, lazy } from 'react'
// import { WorldObjectProps } from '../../database/WorldObject'
// import { DustData } from 'src/components/scenes/Experiment5/world-objects/Dust'
// type Module = Promise<{
//   default: ComponentType<unknown>
// }>
// const delayTest = () => {
//   return new Promise<{ default: ComponentType<WorldObjectProps<DustData>> }>((resolve) => {
//     setTimeout(() => {
//       const Component = import('src/components/scenes/Experiment5/world-objects/Dust')
//       resolve(Component)
//     }, 3000)
//   })
// }

export const worldObjectMap = {
  ['Dust']: lazy(() => import('src/components/scenes/Experiment5/world-objects/Dust')),
  ['PrototypeShip']: lazy(
    () => import('src/components/scenes/Experiment5/world-objects/PrototypeShip')
  ),
} as const

export type WorldObjectComponentId = keyof typeof worldObjectMap
const worldObjects = Object.keys(worldObjectMap) as ReadonlyArray<WorldObjectComponentId>
export default worldObjects
