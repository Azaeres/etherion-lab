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
import { ParallaxCameraProvider, ParallaxLayer } from 'src/components/Parallax'
import useParallaxCameraRef from 'src/components/Parallax/useParallaxCameraRef'

const set = (): AnimatedLogoProps => ({
  x: Math.random() * OPTIONS.width,
  y: Math.random() * OPTIONS.height,
  rotation: Math.random() * 10,
  // scale: Math.max(1, Math.random() * 10),
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
        <ParallaxLayer zIndex={-300}>
          <Logo {...logo1} />
        </ParallaxLayer>
        <ParallaxLayer zIndex={-200}>
          <Logo {...logo2} />
        </ParallaxLayer>
        <ParallaxLayer zIndex={-100}>
          <AnimatedLogo {...transform} />
        </ParallaxLayer>
        <ParallaxLayer zIndex={0}>
          <Logo {...logo3} />
        </ParallaxLayer>
        <ParallaxLayer zIndex={100}>
          <Logo {...logo4} />
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
  // scale: number
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
