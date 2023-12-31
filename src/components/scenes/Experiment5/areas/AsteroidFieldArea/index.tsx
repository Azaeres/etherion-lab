import { ParallaxCameraProvider } from 'pixi-react-parallax'
import { Texture } from 'pixi.js'
import DebugIndicator from 'src/components/DebugIndicator'
import { Vec2Meters } from 'src/utils/physics'
import PlanckWorldProvider from '../../../Experiment2/PlanckWorldProvider'
import { Sprite } from '@pixi/react-animated'
import stars from 'src/components/scenes/Experiment1/assets/Stars-full.webp'
import { styles } from 'src/utils/pixi-styles'
import { Text } from '@pixi/react'
import { OPTIONS } from 'src/components/PixiStage'
// import DustSpawnManager from '../world-objects/Dust/DustSpawnManager'
import CameraObserver from '../../world-objects/CameraObserver'
import { usePeer } from '@peerbit/react'
import { getIdFromPeer } from '../../database'
import { useState } from 'react'
import {
  useCameraPositionUpdateListener,
  useCameraVelocityUpdateListener,
} from '../../world-objects/events'
import { DEFAULT_DUST_CONFIG, useDustOrigin } from './useDustOrigin'
// import objectMap from 'src/utils/objectMap'
import ManifestationBoundary, {
  getDepthStructuredManifests,
} from '../../world-objects/ManifestationBoundary'
import { useAvatarOrigin } from './useAvatarOrigin'

export const DEFAULT_AREA = 'AsteroidFieldArea'

// const getWorldObjectOrigin = (peerId: PeerId) => {
//   return {
//     worldObjectModel: {
//       id: uuid(),
//       component: 'Dust' as WorldObjectComponentId,
//       area: DEFAULT_AREA as AreaId,
//       owner: peerId,
//       orphan: false,
//       pos_x: 0.2 as Meters,
//       pos_y: 0.2 as Meters,
//       data: {
//         cullingDistance: 90,
//       },
//     },
//     unmanifest: () => {},
//   }
// }

export default function AsteroidFieldArea() {
  const { peer } = usePeer()
  const peerId = getIdFromPeer(peer)
  const [cameraPosition, setCameraPosition] = useState<Vec2Meters>()
  useCameraPositionUpdateListener(setCameraPosition)
  const [cameraVelocity, setCameraVelocity] = useState<Vec2Meters>()
  useCameraVelocityUpdateListener(setCameraVelocity)
  const dust = useDustOrigin(DEFAULT_DUST_CONFIG, DEFAULT_AREA, peerId, cameraPosition)
  const avatars = useAvatarOrigin(DEFAULT_AREA, peerId)
  // console.log('AsteroidFieldArea > avatars:', avatars)
  // console.log(' > dust:', dust)
  // console.log(' > dust:', dust)
  // const dust = useDustOrigin(
  //   50,
  //   metersFromPx(5000 as Pixels), // 8000
  //   DEFAULT_AREA,
  //   peerId,
  //   metersFromPx(6000 as Pixels),
  //   cameraPosition
  // )
  // console.log('Calling useDustManifest()...  > dust:', dust)
  const depthStructuredManifests = getDepthStructuredManifests(dust, avatars)
  // const depthStructuredManifests = getDepthStructuredManifests(depthStructuredManifests)

  // const worldObjectOrigins: WorldObjectOrigin[] = useMemo(() => {
  //   const result = []
  //   for (let index = 0; index < 100; index++) {
  //     const origin = getWorldObjectOrigin(peerId)
  //     result.push(origin)
  //   }
  //   return result
  // }, [peerId])

  // console.log('AsteroidFieldArea  > worldObjectOrigins:', worldObjectOrigins)
  // console.log(' > dust:', dust)
  // const [worldObjects, setWorldObjects] = useState<WorldObjectModel[]>([])
  // useEffect(() => {
  //   console.log('setting world objects...  , dust:', dust)
  //   setWorldObjects([...dust])
  // }, [dust])
  // console.log('AsteroidFieldArea > dust:', dust)
  // console.log(' > worldObjects:', worldObjects)
  return (
    <>
      <Sprite texture={Texture.from(stars.src)} x={0} y={0} />
      <Text text="Sector 1" style={styles.largeBody} x={OPTIONS.width / 2 - 180} y={80} />
      <PlanckWorldProvider gravityY={0}>
        <ParallaxCameraProvider movementDamping={2.0}>
          <ManifestationBoundary
            depthStructuredManifests={depthStructuredManifests}
            cameraPosition={cameraPosition}
            cameraVelocity={cameraVelocity}
          />
          {/* <ParallaxLayer zIndex={-500}>
            <AvatarOrigin area="AsteroidFieldArea" />
          </ParallaxLayer> */}
          <CameraObserver />
          <DebugIndicator showCameraPosition />
        </ParallaxCameraProvider>
      </PlanckWorldProvider>
    </>
  )
}

// AsteroidFieldArea.whyDidYouRender = true
