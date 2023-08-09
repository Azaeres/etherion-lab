import { SceneId, sceneMap } from 'src/app/[scene]/scenes'

export default function SceneSwitch({ currentScene }: { currentScene: SceneId }) {
  const { Component } = sceneMap[currentScene]
  return <Component />
}
