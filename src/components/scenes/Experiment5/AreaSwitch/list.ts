import { lazy } from 'react'

// Delayed dynamic import for testing suspense loading view.
// import { ComponentType, lazy } from 'react'
// type Module = Promise<{
//   default: ComponentType<unknown>
// }>
// const delayTest = () => {
//   return new Promise<{ default: ComponentType<unknown> }>((resolve) => {
//     setTimeout(() => {
//       const Component = import('src/components/scenes/Experiment5/areas/AsteroidFieldArea')
//       resolve(Component)
//     }, 3000)
//   })
// }

export const areaMap = {
  ['AsteroidFieldArea']: lazy(
    () => import('src/components/scenes/Experiment5/areas/AsteroidFieldArea')
  ),
  ['NebulaArea']: lazy(() => import('src/components/scenes/Experiment5/areas/NebulaArea')),
  // ['NebulaArea']: lazy(delayTest),
} as const

export type AreaId = keyof typeof areaMap
const areas = Object.keys(areaMap) as ReadonlyArray<AreaId>
export default areas
