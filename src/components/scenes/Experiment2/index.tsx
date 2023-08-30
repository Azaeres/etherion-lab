'use client'
import stars from '../Experiment1/assets/Stars-full.webp'
import { Texture, Spritesheet } from 'pixi.js'
import { Sprite } from '@pixi/react-animated'
import { OPTIONS } from 'src/components/PixiStage'
import { useEffect, useMemo, useState } from 'react'
import { ParallaxCameraProvider, ParallaxLayer } from 'pixi-react-parallax'
import PrototypeShip from './PrototypeShip'
import PlanckWorldProvider from './PlanckWorldProvider'
import PlanckBody from './PlanckBody'
import { Box, Vec2 } from 'planck'
import ControlLayer from './ControlLayer'
import asteroidsTexture from './assets/asteroids/asteroids.webp'
import asteroidsJson from './assets/asteroids/asteroids.json'
import { AnimatedSprite } from '@pixi/react'

const getRandomPosition = () => {
  return {
    x: Math.random() * OPTIONS.width,
    y: Math.random() * OPTIONS.height,
    initialFrame: Math.random() * 64,
  } as const
}

export default function Experiment2() {
  const logo1 = useMemo(getRandomPosition, [])
  const logo2 = useMemo(getRandomPosition, [])
  const logo3 = useMemo(getRandomPosition, [])
  const logo4 = useMemo(getRandomPosition, [])
  const [textures, setTextures] = useState<Texture[] | null>(null)
  useEffect(() => {
    ;(async () => {
      const sheet = new Spritesheet(Texture.from(asteroidsTexture.src), asteroidsJson)
      await sheet.parse()
      // console.log('Spritesheet ready to use!', sheet)
      setTextures(Object.values(sheet.textures))
    })()
  }, [])
  // gravity: -80
  return (
    <>
      <Sprite texture={Texture.from(stars.src)} x={0} y={0} />
      <PlanckWorldProvider gravityY={0}>
        <ParallaxCameraProvider movementDamping={2.0}>
          <ParallaxLayer zIndex={-1250}>
            {textures && (
              <AnimatedSprite
                anchor={0.5}
                textures={textures}
                isPlaying={true}
                animationSpeed={0.01}
                scale={3}
                loop={true}
                {...logo1}
              />
            )}
          </ParallaxLayer>
          <ParallaxLayer zIndex={-800}>
            {textures && (
              <AnimatedSprite
                anchor={0.5}
                textures={textures}
                isPlaying={true}
                animationSpeed={0.01}
                scale={3}
                loop={true}
                {...logo2}
              />
            )}
          </ParallaxLayer>
          <ParallaxLayer zIndex={-500}>
            <PrototypeShip x={2400} />
            <Ground />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-300}>
            {textures && (
              <AnimatedSprite
                anchor={0.5}
                textures={textures}
                isPlaying={true}
                animationSpeed={0.01}
                scale={3}
                loop={true}
                {...logo3}
              />
            )}
          </ParallaxLayer>
          <ParallaxLayer zIndex={0}>
            {textures && (
              <AnimatedSprite
                anchor={0.5}
                textures={textures}
                isPlaying={true}
                animationSpeed={0.01}
                scale={3}
                loop={true}
                {...logo4}
              />
            )}
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
