'use client'
import stars from '../Experiment1/assets/Stars-full.webp'
import { Texture } from 'pixi.js'
import { Sprite } from '@pixi/react-animated'
import { ParallaxCameraProvider, ParallaxLayer } from 'pixi-react-parallax'
import PrototypeShip from './PrototypeShip'
import PlanckWorldProvider from './PlanckWorldProvider'
// import PlanckBody from './PlanckBody'
// import { Box, Vec2 } from 'planck'
import ControlLayer from './ControlLayer'
import AsteroidSpawnManager from './AsteroidSpawnManager'
import { metersFromPx } from 'src/utils/physics'
import DebugIndicator from 'src/components/DebugIndicator'

export default function Experiment2() {
  // gravity: -80
  return (
    <>
      <Sprite texture={Texture.from(stars.src)} x={0} y={0} />
      {/* <DebugWhiteScreen /> */}
      <PlanckWorldProvider gravityY={0}>
        <ParallaxCameraProvider movementDamping={2.0}>
          <ParallaxLayer zIndex={-1550}>
            <AsteroidSpawnManager
              physical={false}
              generationDistance={10000}
              cullingDistance={12000}
              density={40}
            />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-800}>
            <AsteroidSpawnManager
              physical={false}
              generationDistance={5000}
              cullingDistance={6000}
              density={20}
            />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-500}>
            <AsteroidSpawnManager
              generationDistance={5000}
              cullingDistance={6000}
              physical={true}
            />
            <PrototypeShip x={metersFromPx(400)} />
            {/* <Ground /> */}
          </ParallaxLayer>
          <ParallaxLayer zIndex={-300}>
            <AsteroidSpawnManager
              generationDistance={4000}
              cullingDistance={5000}
              physical={false}
              density={10}
            />
          </ParallaxLayer>
          <ParallaxLayer zIndex={0}>
            <AsteroidSpawnManager
              generationDistance={3000}
              cullingDistance={4000}
              physical={false}
              density={5}
            />
          </ParallaxLayer>
          <DebugIndicator />
        </ParallaxCameraProvider>
      </PlanckWorldProvider>
      <ControlLayer />
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
