import { lazy } from 'react'

export const worldObjectMap = {
  ['Dust']: lazy(() => import('src/components/scenes/Experiment5/world-objects/Dust')),
} as const

export type WorldObjectComponentId = keyof typeof worldObjectMap
const worldObjects = Object.keys(worldObjectMap) as ReadonlyArray<WorldObjectComponentId>
export default worldObjects
