import DynamicallyImportedScene from 'src/components/PixiStage/DynamicallyImportedScene'

export const sceneMap = {
  experiment1: {
    Component: () => DynamicallyImportedScene(import('src/components/scenes/Experiment1')),
  },
  experiment2: {
    Component: () => DynamicallyImportedScene(import('src/components/scenes/Experiment2')),
  },
  experiment3: {
    Component: () => DynamicallyImportedScene(import('src/components/scenes/Experiment3')),
  },
  experiment4: {
    Component: () => DynamicallyImportedScene(import('src/components/scenes/Experiment4')),
  },
  experiment5: {
    Component: () => DynamicallyImportedScene(import('src/components/scenes/Experiment5')),
  },
} as const

export type SceneId = keyof typeof sceneMap | '/'
const scenes = Object.keys(sceneMap) as ReadonlyArray<SceneId>
export default scenes
