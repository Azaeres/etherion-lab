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
  experiment6: lazy(() => import('src/components/scenes/Experiment6')),
} as const

type SceneMeta = {
  title: string
  description: string
  path?: string
}

export const sceneMeta: { [K in SceneId]: SceneMeta } = {
  '/': {
    title: 'Home',
    description: 'List of experiments.',
  },
  experiment1: {
    title: 'Parallax Demonstration',
    description:
      'Basic PixiJS setup to demonstrate the parallax library, published on NPM as `pixi-react-parallax`.',
  },
  experiment2: {
    title: 'Asteroids Clone',
    description: 'PixiJS React with Planck.js physics engine and parallax.',
  },
  experiment3: {
    title: 'Basic Peerbit Integration',
    description: 'Basic Peerbit integration with starfield.',
  },
  experiment4: {
    title: 'Peerbit Chat',
    description: 'A Peerbit P2P chat app.',
  },
  experiment5: {
    title: 'Peerbit Asteroids Clone',
    description: 'Deeper Peerbit integration into Asteroids clone.',
  },
  experiment6: {
    title: 'Etherion Story Builder',
    description: 'Visual novel story building tool.',
    path: '/zhariel/1/1',
  },
} as const

export type SceneId = keyof typeof sceneMap | '/'
const scenes = Object.keys(sceneMap) as ReadonlyArray<SceneId>
export default scenes
