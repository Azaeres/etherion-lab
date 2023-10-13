import { SceneId, sceneMap } from '../scenes/scenes'

export default function SceneSwitch({ currentScene }: { currentScene: SceneId }) {
  if (currentScene !== '/') {
    const { Component } = sceneMap[currentScene]
    return <Component />
  }
}
