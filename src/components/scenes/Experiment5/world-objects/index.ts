import { WorldObjectProps } from '../database/WorldObject'
import Dust from './Dust'
import DynamicallyImportedComponent from './DynamicallyImportedComponent'

export const worldObjectMap = {
  ['Dust']: {
    Component: Dust,
  },
  // ['Dust']: {
  //   Component: (props: WorldObjectProps<object | undefined>) =>
  //     DynamicallyImportedComponent(
  //       import('src/components/scenes/Experiment5/world-objects/Dust'),
  //       props
  //     ),
  // },
  ['NebulaArea']: {
    Component: (props: WorldObjectProps<object | undefined>) =>
      DynamicallyImportedComponent(
        import('src/components/scenes/Experiment5/areas/NebulaArea'),
        props
      ),
  },
} as const

export type WorldObjectComponentId = keyof typeof worldObjectMap
const worldObjects = Object.keys(worldObjectMap) as ReadonlyArray<WorldObjectComponentId>
export default worldObjects
