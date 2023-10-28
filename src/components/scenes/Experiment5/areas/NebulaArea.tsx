import { ParallaxCameraProvider, ParallaxLayer } from 'pixi-react-parallax'
import { Texture } from 'pixi.js'
import DebugIndicator from 'src/components/DebugIndicator'
import { metersFromPx, Pixels, Vec2Meters } from 'src/utils/physics'
import PlanckWorldProvider from '../../Experiment2/PlanckWorldProvider'
import { Sprite } from '@pixi/react-animated'
import stars from 'src/components/scenes/Experiment1/assets/Stars-full.webp'
import AvatarOrigin from '../world-objects/Avatar/AvatarOrigin'
import { styles } from 'src/utils/pixi-styles'
import { Text } from '@pixi/react'
import { radiansFromDegrees } from '../../Experiment2/Button'
import { OPTIONS } from 'src/components/PixiStage'
import CameraObserver from '../world-objects/CameraObserver'
import { DustConfig, useDustManifest } from '../world-objects/Dust/useDustManifest'
import { usePeer } from '@peerbit/react'
import { getIdFromPeer } from '../database'
import { useState } from 'react'
import {
  useCameraPositionUpdateListener,
  useCameraVelocityUpdateListener,
} from '../world-objects/events'
import getWorldObjectManifests from '../hooks/getWorldObjectManifests'
import ManifestationBoundary, {
  getDepthStructuredManifests,
} from '../AreaSwitch/ManifestationBoundary'

const dustConfig: DustConfig = {
  '-300': {
    density: 30, // 20
    generationDistance: metersFromPx(3700 as Pixels),
    cullingDistance: metersFromPx(3000 as Pixels),
  },
  '-800': {
    density: 40, // 30
    generationDistance: metersFromPx(5700 as Pixels),
    cullingDistance: metersFromPx(4800 as Pixels),
  },
  '-1450': {
    density: 160, // 50
    generationDistance: metersFromPx(8500 as Pixels),
    cullingDistance: metersFromPx(9000 as Pixels),
  },
} as const

const AREA = 'NebulaArea'

export default function NebulaArea() {
  const { peer } = usePeer()
  const peerId = getIdFromPeer(peer)
  const [cameraPosition, setCameraPosition] = useState<Vec2Meters>()
  useCameraPositionUpdateListener(setCameraPosition)
  const [cameraVelocity, setCameraVelocity] = useState<Vec2Meters>()
  useCameraVelocityUpdateListener(setCameraVelocity)
  const dust = useDustManifest(dustConfig, AREA, peerId, cameraPosition)
  const worldObjectManifests = getWorldObjectManifests(dust)
  const depthStructuredManifests = getDepthStructuredManifests(worldObjectManifests)
  return (
    <>
      <Sprite
        texture={Texture.from(stars.src)}
        x={OPTIONS.width / 2}
        y={OPTIONS.height / 2}
        anchor={0.5}
        rotation={radiansFromDegrees(180)}
      />
      <Text text="Sector 2" style={styles.largeBody} x={OPTIONS.width / 2 - 180} y={80} />
      <PlanckWorldProvider gravityY={0}>
        <ParallaxCameraProvider movementDamping={2.0}>
          {/* <ParallaxLayer zIndex={-1250}>
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
          </ParallaxLayer> */}
          <ManifestationBoundary
            depthStructuredManifests={depthStructuredManifests}
            cameraPosition={cameraPosition}
            cameraVelocity={cameraVelocity}
          />
          <ParallaxLayer zIndex={-500}>
            {/* <DustSpawnManager
              density={50}
              generationDistance={metersFromPx(5000 as Pixels)}
              cullingDistance={metersFromPx(6000 as Pixels)}
            /> */}
            <AvatarOrigin area="NebulaArea" />
          </ParallaxLayer>
          {/* <ParallaxLayer zIndex={-300}></ParallaxLayer>
          <ParallaxLayer zIndex={-1}></ParallaxLayer> */}
          <CameraObserver />
          <DebugIndicator showCameraPosition />
        </ParallaxCameraProvider>
      </PlanckWorldProvider>
    </>
  )
}
