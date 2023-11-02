import { SceneId, sceneMap } from './list'
import { Suspense } from 'react'
// import Curtain from '../Curtain/Curtain';
import { Text } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import { OPTIONS } from 'src/components/PixiStage'

const style = new TextStyle({
  dropShadow: true,
  dropShadowAlpha: 0.8,
  fill: '0xffffff',
  fontSize: 54,
})

export default function SceneSwitch({ currentScene }: { currentScene: SceneId }) {
  if (currentScene !== '/') {
    const Component = sceneMap[currentScene]
    return (
      <Suspense
        fallback={
          <>
            <Text
              text="Loading..."
              style={style}
              anchor={{ x: 0.5, y: 0.5 }}
              x={OPTIONS.width / 2}
              y={OPTIONS.height / 2}
            />
            {/* <Curtain /> */}
          </>
        }
      >
        <Component />
      </Suspense>
    )
  }
}
