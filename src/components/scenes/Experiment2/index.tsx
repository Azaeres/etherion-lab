'use client'
import Logo from 'src/components/Logo'
import stars from '../Experiment1/assets/Stars-full.webp'
import { Texture } from 'pixi.js'
import { Sprite } from '@pixi/react-animated'
import { OPTIONS } from 'src/components/PixiStage'
import { useMemo } from 'react'
import { ParallaxCameraProvider, ParallaxLayer } from 'pixi-react-parallax'
import PrototypeShip from './PrototypeShip'
import PlanckWorldProvider from './PlanckWorldProvider'
import PlanckBody from './PlanckBody'
import { Box, Vec2 } from 'planck'
import ControlLayer from './ControlLayer'

const getRandomPosition = () => {
  return {
    x: Math.random() * OPTIONS.width,
    y: Math.random() * OPTIONS.height,
  } as const
}

export default function Experiment2() {
  const logo1 = useMemo(getRandomPosition, [])
  const logo2 = useMemo(getRandomPosition, [])
  const logo3 = useMemo(getRandomPosition, [])
  const logo4 = useMemo(getRandomPosition, [])
  // gravity: -80
  return (
    <>
      <Sprite texture={Texture.from(stars.src)} x={0} y={0} />
      <PlanckWorldProvider gravityY={0}>
        <ParallaxCameraProvider movementDamping={2.0}>
          <ParallaxLayer zIndex={-1250}>
            {/* Very far away from the camera */}
            <Logo {...logo1} />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-800}>
            {/* A bit closer */}
            <Logo {...logo2} />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-500}>
            {/* Normal distance. No auto-scaling applied. */}
            <PrototypeShip x={2400} />
            <Ground />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-300}>
            {/* Closer still */}
            <Logo {...logo3} />
          </ParallaxLayer>
          <ParallaxLayer zIndex={0}>
            {/* Don't exceed the focal length (default 300) or it'll pass behind the camera. Technically, it gets mirrored, and looks weird. */}
            {/* Very close! */}
            <Logo {...logo4} />
          </ParallaxLayer>
        </ParallaxCameraProvider>
      </PlanckWorldProvider>
      <ControlLayer />
    </>
  )
}

const groundFixtures = [
  {
    shape: Box(50.0, 1.0),
    density: 0.0,
    // friction: 0.3,
  },
] as const

function Ground() {
  return (
    <PlanckBody
      bodyDef={{
        type: 'static',
        position: Vec2(0.0, -30.0),
      }}
      fixtureDefs={groundFixtures}
      debugDraw={true}
    ></PlanckBody>
  )
}
