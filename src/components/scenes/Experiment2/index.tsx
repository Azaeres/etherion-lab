'use client'
import stars from '../Experiment1/assets/Stars-full.webp'
import { Texture } from 'pixi.js'
import { Sprite } from '@pixi/react-animated'
import { ParallaxCameraProvider, ParallaxLayer } from 'pixi-react-parallax'
import PrototypeShip from './PrototypeShip'
import PlanckWorldProvider from './PlanckWorldProvider'
import ControlLayer from './ControlLayer'
import AsteroidSpawnManager from './Asteroid/AsteroidSpawnManager'
import { Pixels, metersFromPx } from 'src/utils/physics'
import DebugIndicator from 'src/components/DebugIndicator'
import { ParallaxCameraContext } from 'pixi-react-parallax'
import { useTick } from '@pixi/react'
import { useCallback, useContext, useState } from 'react'
import { Vec2 } from 'planck'
import { Vec2Meters } from 'src/utils/physics'
import { emitCameraPositionUpdate, emitCameraVelocityUpdate } from './events'
import DustSpawnManager from './Dust/DustSpawnManager'

const ENABLE_ASTEROIDS = true

export default function Experiment2() {
  // gravity: -80
  return (
    <>
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
            <PrototypeShip x={metersFromPx(400 as Pixels)} />
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
          <DebugIndicator showCameraVelocity />
        </ParallaxCameraProvider>
      </PlanckWorldProvider>
      <ControlLayer />
    </>
  )
}

function CameraObserver() {
  const camera = useContext(ParallaxCameraContext)
  const [lastCameraPosition, setLastCameraPosition] = useState<Vec2Meters>()
  const update = useCallback(() => {
    if (camera) {
      const cameraPosition = new Vec2(
        metersFromPx(camera.x as Pixels),
        metersFromPx(-camera.y as Pixels)
      ) as Vec2Meters
      // console.log(' > camera.x, cameraPosition.x:', delta, camera.x, cameraPosition.x)
      if (lastCameraPosition) {
        const velocity = cameraPosition.clone() as Vec2Meters
        velocity.sub(lastCameraPosition)
        // console.log('camera  > velocity:', velocity.x)
        velocity.mul(60.0)
        emitCameraVelocityUpdate(velocity)
      }
      setLastCameraPosition(cameraPosition)
      emitCameraPositionUpdate(cameraPosition)
    }
  }, [camera, lastCameraPosition])
  useTick(update)
  return null
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
