'use client'
import stars from '../Experiment1/assets/Stars-full.webp'
import { Texture } from 'pixi.js'
import { Sprite } from '@pixi/react-animated'
import { ParallaxCameraProvider, ParallaxLayer } from 'pixi-react-parallax'
import PrototypeShip from '../Experiment3/PrototypeShip'
import PlanckWorldProvider from './PlanckWorldProvider'
import ControlLayer from './ControlLayer'
import AsteroidSpawnManager from './Asteroid/AsteroidSpawnManager'
import { Meters, Pixels, metersFromPx } from 'src/utils/physics'
import DebugIndicator from 'src/components/DebugIndicator'
import DustSpawnManager from './Dust/DustSpawnManager'
import CameraObserver from './CameraObserver'
import { radiansFromDegrees } from './Button'

import { PeerbitContext, usePeerbitDatabaseSetup } from '../Experiment3/hooks/usePeerbitDatabase'
// import { Ed25519PublicKey } from '@peerbit/crypto'

const ENABLE_ASTEROIDS = true
// A random ID, but unique for this app
// const ID = new Uint8Array([
//   30, 222, 227, 76, 164, 10, 61, 8, 21, 176, 122, 5, 79, 110, 115, 255, 233, 253, 92, 76, 146, 158,
//   46, 212, 14, 162, 30, 94, 1, 134, 99, 174,
// ])
// const MOCK_PEER_ID = new Ed25519PublicKey({
//   publicKey: ID,
// }) as PeerId

export default function Experiment2() {
  const peerbit = usePeerbitDatabaseSetup()
  const { peerId } = peerbit
  console.log('Experiment2 > peerbit', peerbit)
  // gravity: -80
  return (
    <>
      <PeerbitContext.Provider value={peerbit}>
        <Sprite texture={Texture.from(stars.src)} x={0} y={0} />
        {/* <DebugWhiteScreen /> */}
        <PlanckWorldProvider gravityY={0}>
          <ParallaxCameraProvider movementDamping={2.0}>
            <ParallaxLayer zIndex={-1250}>
              {ENABLE_ASTEROIDS && (
                <AsteroidSpawnManager
                  physical={false}
                  generationDistance={8000}
                  cullingDistance={9000}
                  density={25}
                />
              )}
              <DustSpawnManager
                density={20}
                generationDistance={metersFromPx(8000 as Pixels)}
                cullingDistance={metersFromPx(9000 as Pixels)}
              />
            </ParallaxLayer>
            <ParallaxLayer zIndex={-800}>
              {ENABLE_ASTEROIDS && (
                <AsteroidSpawnManager
                  physical={false}
                  generationDistance={6000}
                  cullingDistance={7000}
                  density={30}
                />
              )}
              <DustSpawnManager
                density={30}
                generationDistance={metersFromPx(6000 as Pixels)}
                cullingDistance={metersFromPx(7000 as Pixels)}
              />
            </ParallaxLayer>
            <ParallaxLayer zIndex={-500}>
              {ENABLE_ASTEROIDS && (
                <AsteroidSpawnManager
                  generationDistance={5000}
                  cullingDistance={6000}
                  physical={true}
                  density={40}
                />
              )}
              <DustSpawnManager
                density={50}
                generationDistance={metersFromPx(5000 as Pixels)}
                cullingDistance={metersFromPx(6000 as Pixels)}
              />
              {peerId && (
                <PrototypeShip
                  area="AsteroidFieldArea"
                  pos_x={metersFromPx(400 as Pixels)}
                  pos_y={0.0 as Meters}
                  rotation={radiansFromDegrees(-90)}
                  scale={6}
                  owner={peerId}
                  orphan={false}
                />
              )}
              {/* <Ground /> */}
            </ParallaxLayer>
            <ParallaxLayer zIndex={-300}>
              {ENABLE_ASTEROIDS && (
                <AsteroidSpawnManager
                  generationDistance={4000}
                  cullingDistance={5000}
                  physical={false}
                  density={8}
                />
              )}
            </ParallaxLayer>
            <ParallaxLayer zIndex={-1}>
              {ENABLE_ASTEROIDS && (
                <AsteroidSpawnManager
                  generationDistance={3000}
                  cullingDistance={4000}
                  physical={false}
                  density={4}
                />
              )}
            </ParallaxLayer>
            <CameraObserver />
            <DebugIndicator showCameraPosition />
          </ParallaxCameraProvider>
        </PlanckWorldProvider>
        <ControlLayer />
      </PeerbitContext.Provider>
    </>
  )
}

// const groundFixtures = [
//   {
//     shape: Box(50.0, 1.0),
//     density: 0.0,
//     // friction: 0.3,
//   },
// ] as const

// function Ground() {
//   return (
//     <PlanckBody
//       bodyDef={{
//         type: 'static',
//         position: Vec2(0.0, -30.0),
//       }}
//       fixtureDefs={groundFixtures}
//       debugDraw={true}
//     ></PlanckBody>
//   )
// }
