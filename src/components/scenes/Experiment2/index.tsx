'use client'
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
import asteroidsTexture from './assets/asteroids/asteroids.webp'
import asteroidsJson from './assets/asteroids/asteroids.json'
import { AnimatedSprite } from '@pixi/react'
import AsteroidSpawnManager from './AsteroidSpawnManager'
import { metersFromPx } from 'src/utils/physics'
import DebugIndicator from 'src/components/DebugIndicator'
import useSpritesheetTextures from 'src/app/hooks/useSpritesheetTextures'

const getRandomPosition = () => {
  return {
    x: Math.random() * OPTIONS.width,
    y: Math.random() * OPTIONS.height,
    initialFrame: Math.floor(Math.random() * 64),
  } as const
}

const ASTEROID_TINT = '#777'

export default function Experiment2() {
  const logo1 = useMemo(getRandomPosition, [])
  const logo2 = useMemo(getRandomPosition, [])
  const logo3 = useMemo(getRandomPosition, [])
  const logo4 = useMemo(getRandomPosition, [])
  const textures = useSpritesheetTextures(asteroidsTexture.src, asteroidsJson)
  const textureValues = textures && Object.values(textures)
  // const [gravity, setGravity] = useState(0)
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setGravity(-80)
  //   }, 5000)
  //   return () => {
  //     clearInterval(timer)
  //   }
  // }, [])
  // gravity: -80
  return (
    <>
      <Sprite texture={Texture.from(stars.src)} x={0} y={0} />
      {/* <DebugWhiteScreen /> */}
      <PlanckWorldProvider gravityY={0}>
        <ParallaxCameraProvider movementDamping={2.0}>
          <ParallaxLayer zIndex={-1250}>
            {textures && (
              <AnimatedSprite
                textures={textureValues}
                anchor={0.5}
                isPlaying={true}
                animationSpeed={0.01}
                scale={1.8}
                tint={ASTEROID_TINT}
                loop={true}
                {...logo1}
              />
            )}
          </ParallaxLayer>
          <ParallaxLayer zIndex={-800}>
            {textures && (
              <AnimatedSprite
                textures={textureValues}
                anchor={0.5}
                isPlaying={true}
                animationSpeed={0.01}
                scale={1.8}
                tint={ASTEROID_TINT}
                loop={true}
                {...logo2}
              />
            )}
          </ParallaxLayer>
          <ParallaxLayer zIndex={-500}>
            <PrototypeShip x={metersFromPx(400)} />
            <AsteroidSpawnManager />
            <Ground />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-300}>
            {textures && (
              <AnimatedSprite
                textures={textureValues}
                anchor={0.5}
                isPlaying={true}
                animationSpeed={0.01}
                scale={1.8}
                tint={ASTEROID_TINT}
                loop={true}
                {...logo3}
              />
            )}
          </ParallaxLayer>
          <ParallaxLayer zIndex={0}>
            {textures && (
              <AnimatedSprite
                textures={textureValues}
                anchor={0.5}
                isPlaying={true}
                animationSpeed={0.01}
                scale={1.8}
                tint={ASTEROID_TINT}
                loop={true}
                {...logo4}
              />
            )}
          </ParallaxLayer>
          <DebugIndicator />
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
