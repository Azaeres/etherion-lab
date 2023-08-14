import { SceneId, sceneMap } from 'src/app/[scene]/scenes'

export default function SceneSwitch({ currentScene }: { currentScene: SceneId }) {
  if (currentScene !== '/') {
    const { Component } = sceneMap[currentScene]
    return <Component />
  }
}
