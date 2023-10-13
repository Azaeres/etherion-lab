import DynamicallyImportedArea from './DynamicallyImportedArea'

export const areaMap = {
  ['AsteroidFieldArea']: {
    Component: () =>
      DynamicallyImportedArea(import('src/components/scenes/Experiment5/areas/AsteroidFieldArea')),
  },
  ['NebulaArea']: {
    Component: () =>
      DynamicallyImportedArea(import('src/components/scenes/Experiment5/areas/NebulaArea')),
  },
} as const

export type AreaId = keyof typeof areaMap
const areas = Object.keys(areaMap) as ReadonlyArray<AreaId>
export default areas
