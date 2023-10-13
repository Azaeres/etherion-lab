import { ParallaxCameraProvider, ParallaxLayer } from 'pixi-react-parallax'
import { Texture } from 'pixi.js'
import DebugIndicator from 'src/components/DebugIndicator'
import { metersFromPx, Pixels } from 'src/utils/physics'
import CameraObserver from '../../Experiment2/CameraObserver'
import DustSpawnManager from '../../Experiment2/Dust/DustSpawnManager'
import PlanckWorldProvider from '../../Experiment2/PlanckWorldProvider'
import { Sprite } from '@pixi/react-animated'
import stars from 'src/components/scenes/Experiment1/assets/Stars-full.webp'
import AvatarOrigin from '../Avatar/AvatarOrigin'
import { styles } from 'src/utils/pixi-styles'
import { Text } from '@pixi/react'
import { OPTIONS } from 'src/components/PixiStage'

export const DEFAULT_AREA = 'AsteroidFieldArea'

export default function AsteroidFieldArea() {
  return (
    <>
      <Sprite texture={Texture.from(stars.src)} x={0} y={0} />
      <Text text="Sector 1" style={styles.largeBody} x={OPTIONS.width / 2 - 180} y={80} />
      <PlanckWorldProvider gravityY={0}>
        <ParallaxCameraProvider movementDamping={2.0}>
          <ParallaxLayer zIndex={-1250}>
            <DustSpawnManager
              density={20}
              generationDistance={metersFromPx(8000 as Pixels)}
              cullingDistance={metersFromPx(9000 as Pixels)}
            />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-800}>
            <DustSpawnManager
              density={30}
              generationDistance={metersFromPx(6000 as Pixels)}
              cullingDistance={metersFromPx(7000 as Pixels)}
            />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-500}>
            <DustSpawnManager
              density={50}
              generationDistance={metersFromPx(5000 as Pixels)}
              cullingDistance={metersFromPx(6000 as Pixels)}
            />
            <AvatarOrigin area="AsteroidFieldArea" />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-300}></ParallaxLayer>
          <ParallaxLayer zIndex={-1}></ParallaxLayer>
          <CameraObserver />
          <DebugIndicator showCameraPosition />
        </ParallaxCameraProvider>
      </PlanckWorldProvider>
    </>
  )
}
