import { ParallaxCameraProvider, ParallaxLayer } from 'pixi-react-parallax'
import { Texture } from 'pixi.js'
import DebugIndicator from 'src/components/DebugIndicator'
import { Meters, Vec2Meters } from 'src/utils/physics'
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
import ManifestationBoundary, {
  getDepthStructuredManifests,
} from '../AreaSwitch/ManifestationBoundary'

const dustConfig: DustConfig = {
  '-400': {
    density: 30, // 40
    generationDistance: 30.0 as Meters,
    cullingDistance: 31.0 as Meters,
  },
  '-800': {
    density: 40, // 30
    generationDistance: 48.0 as Meters,
    cullingDistance: 49.0 as Meters,
  },
  '-1200': {
    density: 50, // 50
    generationDistance: 65.0 as Meters,
    cullingDistance: 66.0 as Meters,
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
  const depthStructuredManifests = getDepthStructuredManifests(dust)
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
          <ManifestationBoundary
            depthStructuredManifests={depthStructuredManifests}
            cameraPosition={cameraPosition}
            cameraVelocity={cameraVelocity}
          />
          <ParallaxLayer zIndex={-500}>
            <AvatarOrigin area="NebulaArea" />
          </ParallaxLayer>
          <CameraObserver />
          <DebugIndicator showCameraPosition />
        </ParallaxCameraProvider>
      </PlanckWorldProvider>
    </>
  )
}
