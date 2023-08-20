'use client'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import Logo from 'src/components/Logo'
import stars from './assets/Stars-full.webp'
import * as PIXI from 'pixi.js'
import { Spring } from 'react-spring'
import { Sprite } from '@pixi/react-animated'
import logo from 'src/components/Logo/etherion-logo.png'
import { OPTIONS } from 'src/components/PixiStage'
import { useCallback, useContext, useMemo, useState } from 'react'
import {
  ParallaxCameraContext,
  ParallaxCameraProvider,
  ParallaxLayer,
  useParallaxCameraRef,
} from 'pixi-react-parallax'
import { Container, Text } from '@pixi/react'

const set = (): AnimatedLogoProps => ({
  x: Math.random() * OPTIONS.width,
  y: Math.random() * OPTIONS.height,
  rotation: Math.random() * 10,
  // scale: Math.max(1, Math.random() * 4),
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
      <ParallaxCameraProvider>
        <ParallaxLayer zIndex={-18000}>
          <Sprite texture={PIXI.Texture.from(stars.src)} x={0} y={0} anchor={0.5} scale={65} />
        </ParallaxLayer>
        <ParallaxLayer zIndex={-850}>
          {/* Very far away from the camera */}
          <Logo {...logo1} />
        </ParallaxLayer>
        <ParallaxLayer zIndex={-400}>
          {/* A bit closer */}
          <Logo {...logo2} />
        </ParallaxLayer>
        <ParallaxLayer zIndex={-200}>
          {/* Closer still */}
          <Logo {...logo3} />
        </ParallaxLayer>
        <ParallaxLayer zIndex={0}>
          {/* Normal distance. No auto-scaling applied. */}
          <AnimatedLogo {...transform} />
        </ParallaxLayer>
        <ParallaxLayer zIndex={100}>
          {/* Don't exceed the focal length (default 300) or it'll pass behind the camera. Technically, it gets mirrored, and looks weird. */}
          {/* Very close! */}
          <Logo {...logo4} />
        </ParallaxLayer>
      </ParallaxCameraProvider>
      <Text
        text="⬅️ Home"
        x={100}
        y={50}
        scale={2}
        onpointerup={navigate('/')}
        cursor="pointer"
        eventMode="static"
        style={new PIXI.TextStyle({ fill: '0xcccccc', fontSize: '38px' })}
      />
      <Text
        text="pixi-react-parallax"
        x={OPTIONS.width - 700}
        y={50}
        scale={2}
        style={new PIXI.TextStyle({ fill: '0xffffff', fontSize: '38px' })}
      />
      <Text
        text={`Click/tap anywhere to move the camera target.\nClick/tap on the camera target to also cause the camera to shake!`}
        x={100}
        y={200}
        scale={2}
        style={new PIXI.TextStyle({ fill: '0xcccccc', fontSize: '22px' })}
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
  const [, setCameraTargetRef] = useParallaxCameraRef()
  const camera = useContext(ParallaxCameraContext)
  const click = useCallback(() => {
    camera?.shake(40, 0.2)
  }, [camera])
  return (
    <Spring
      to={props}
      config={{ mass: 10, tension: 1000, friction: 100 /*, duration: 4000 */ }}
      loop
    >
      {(props) => (
        <Sprite
          anchor={0.5}
          texture={PIXI.Texture.from(logo.src)}
          {...props}
          onpointerup={click}
          cursor="pointer"
          eventMode="dynamic"
          ref={setCameraTargetRef}
        />
      )}
    </Spring>
  )
}
