'use client'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import Logo from 'src/components/Logo'
import stars from './assets/Stars-full.webp'
import * as PIXI from 'pixi.js'
import { Spring } from 'react-spring'
import { Container, Sprite } from '@pixi/react-animated'
import logo from 'src/components/Logo/etherion-logo.png'
import { OPTIONS } from 'src/components/PixiStage'
import { useCallback, useMemo, useState } from 'react'
import { ParallaxCameraProvider, ParallaxLayer, useParallaxCameraRef } from 'pixi-react-parallax'
import { Text } from '@pixi/react'

const set = (): AnimatedLogoProps => ({
  x: Math.random() * OPTIONS.width,
  y: Math.random() * OPTIONS.height,
  rotation: Math.random() * 10,
  scale: Math.max(1, Math.random() * 4),
})

const getRandomPosition = () => {
  return {
    x: Math.random() * OPTIONS.width,
    y: Math.random() * OPTIONS.height,
  }
}

export default function Experiment1() {
  const navigate = useNextjsNavigate()
  const [transform, setTransform] = useState<AnimatedLogoProps>(set)
  const click = useCallback(() => {
    setTransform(set)
  }, [])
  const logo1 = useMemo(getRandomPosition, [])
  const logo2 = useMemo(getRandomPosition, [])
  const logo3 = useMemo(getRandomPosition, [])
  const logo4 = useMemo(getRandomPosition, [])
  return (
    <Container onpointerup={click} eventMode="static">
      <Sprite texture={PIXI.Texture.from(stars.src)} x={0} y={0} />
      <ParallaxCameraProvider>
        <ParallaxLayer zIndex={-450}>
          <Text
            text={`Very far away from the camera`}
            style={
              new PIXI.TextStyle({
                fill: '0xcccccc',
              })
            }
            {...logo1}
          />
        </ParallaxLayer>
        <ParallaxLayer zIndex={-300}>
          <Text
            text={`A bit closer`}
            style={
              new PIXI.TextStyle({
                fill: '0xcccccc',
              })
            }
            {...logo2}
          />
        </ParallaxLayer>
        <ParallaxLayer zIndex={-150}>
          <Text
            text={`Closer still`}
            style={
              new PIXI.TextStyle({
                fill: '0xcccccc',
              })
            }
            {...logo3}
          />
        </ParallaxLayer>
        <ParallaxLayer zIndex={0}>
          {/* Normal distance. No scaling required. */}
          <AnimatedLogo {...transform} />
        </ParallaxLayer>
        <ParallaxLayer zIndex={150}>
          {/* Don't exceed the focal length (default 300) or it'll pass behind the camera. Technically, it gets mirrored, and looks weird. */}
          <Text
            text={`Very close!`}
            style={
              new PIXI.TextStyle({
                fill: '0xcccccc',
              })
            }
            {...logo4}
          />
        </ParallaxLayer>
      </ParallaxCameraProvider>
      <Logo
        x={200}
        y={100}
        onpointerup={navigate('experiment2')}
        cursor="pointer"
        eventMode="static"
      />
    </Container>
  )
}
interface AnimatedLogoProps {
  x: number
  y: number
  rotation: number
  scale: number
}

function AnimatedLogo(props: AnimatedLogoProps) {
  const [, setPlayerRef] = useParallaxCameraRef()
  return (
    <Spring
      to={props}
      config={{ mass: 10, tension: 1000, friction: 100 /*, duration: 4000 */ }}
      loop
    >
      {(props) => (
        <Sprite anchor={0.5} texture={PIXI.Texture.from(logo.src)} {...props} ref={setPlayerRef} />
      )}
    </Spring>
  )
}
