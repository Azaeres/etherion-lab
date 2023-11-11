import { ParallaxCameraProvider } from 'pixi-react-parallax'
import { Texture } from 'pixi.js'
import DebugIndicator from 'src/components/DebugIndicator'
import { Vec2Meters } from 'src/utils/physics'
import PlanckWorldProvider from '../../../Experiment2/PlanckWorldProvider'
import { Sprite } from '@pixi/react-animated'
import stars from 'src/components/scenes/Experiment1/assets/Stars-full.webp'
import { styles } from 'src/utils/pixi-styles'
import { Text } from '@pixi/react'
import { radiansFromDegrees } from '../../../Experiment2/Button'
import { OPTIONS } from 'src/components/PixiStage'
import CameraObserver from '../../world-objects/CameraObserver'
import { DEFAULT_DUST_CONFIG, useDustOrigin } from '../AsteroidFieldArea/useDustOrigin'
import { usePeer } from '@peerbit/react'
import { getIdFromPeer } from '../../database'
import { useState } from 'react'
import {
  useCameraPositionUpdateListener,
  useCameraVelocityUpdateListener,
} from '../../world-objects/events'
import ManifestationBoundary, {
  getDepthStructuredManifests,
} from '../../world-objects/ManifestationBoundary'
import { useAvatarOrigin } from '../AsteroidFieldArea/useAvatarOrigin'

const AREA = 'NebulaArea'

export default function NebulaArea() {
  const { peer } = usePeer()
  const peerId = getIdFromPeer(peer)
  const [cameraPosition, setCameraPosition] = useState<Vec2Meters>()
  useCameraPositionUpdateListener(setCameraPosition)
  const [cameraVelocity, setCameraVelocity] = useState<Vec2Meters>()
  useCameraVelocityUpdateListener(setCameraVelocity)
  const dust = useDustOrigin(DEFAULT_DUST_CONFIG, AREA, peerId, cameraPosition)
  const avatars = useAvatarOrigin(AREA, peerId)
  const depthStructuredManifests = getDepthStructuredManifests(dust, avatars)
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
          {/* <ParallaxLayer zIndex={-500}>
            <AvatarOrigin area="NebulaArea" />
          </ParallaxLayer> */}
          <CameraObserver />
          <DebugIndicator showCameraPosition />
        </ParallaxCameraProvider>
      </PlanckWorldProvider>
    </>
  )
}
