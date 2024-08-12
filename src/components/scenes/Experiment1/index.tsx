'use client'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import Logo from 'src/components/Logo'
import stars from './assets/Stars-full.webp'
import { Texture, TextStyle } from 'pixi.js'
import { Spring } from 'react-spring'
import { Sprite } from '@pixi/react-animated'
import logo from 'src/components/Logo/etherion-logo.png'
import { OPTIONS } from 'src/components/PixiStage'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  ParallaxCameraContext,
  ParallaxCameraProvider,
  ParallaxLayer,
  useParallaxCameraRef,
} from 'pixi-react-parallax'
import type { ParallaxCamera } from 'pixi-react-parallax'
import { Text } from '@pixi/react'
import Button from '../Experiment2/Button'
import Overlay from '../Experiment2/Overlay'
import DebugIndicator from 'src/components/DebugIndicator'

const texture = Texture.from(stars.src)

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
  const [camera, setCamera] = useState<ParallaxCamera | null>()
  const onCamera = useCallback(setCamera, [setCamera])
  const pointerDown = useCallback(() => {
    camera?.shake(40, 0.2)
  }, [camera])
  const pointerUp = useCallback(() => {
    setTransform(set)
  }, [])
  const logo1 = useMemo(getRandomPosition, [])
  const logo2 = useMemo(getRandomPosition, [])
  const logo3 = useMemo(getRandomPosition, [])
  const logo4 = useMemo(getRandomPosition, [])
  return (
    <>
      <ParallaxCameraProvider>
        <ParallaxLayer zIndex={-18000}>
          <Sprite texture={texture} x={0} y={0} anchor={0.5} scale={65} />
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
          <AnimatedLogo {...transform} onCamera={onCamera} />
        </ParallaxLayer>
        <ParallaxLayer zIndex={100}>
          {/* Don't exceed the focal length (default 300) or it'll pass behind the camera. Technically, it gets mirrored, and looks weird. */}
          {/* Very close! */}
          <Logo {...logo4} />
        </ParallaxLayer>
        <DebugIndicator />
      </ParallaxCameraProvider>
      <Text
        text="pixi-react-parallax"
        x={OPTIONS.width - 700}
        y={50}
        scale={2}
        style={new TextStyle({ fill: '0xffffff', fontSize: '38px' })}
      />
      <Text
        text={`Click/tap down anywhere to shake the camera.\nClick/tap up to move the camera target to a random location!`}
        x={100}
        y={200}
        scale={2}
        style={new TextStyle({ fill: '0xcccccc', fontSize: '22px' })}
      />
      <Overlay onPointerDown={pointerDown} onPointerUp={pointerUp} />
      <Button text="&equiv; Menu" x={100} y={50} width={300} height={100} onPress={navigate('/')} />
    </>
  )
}
interface AnimatedLogoProps {
  x: number
  y: number
  rotation: number
  // scale: number
  onCamera?: (camera: ParallaxCamera) => void
}

function AnimatedLogo(props: AnimatedLogoProps) {
  const springProps = { ...props }
  delete springProps.onCamera
  const [, setCameraTargetRef] = useParallaxCameraRef()
  const camera = useContext(ParallaxCameraContext)
  const { onCamera } = props
  useEffect(() => {
    camera && onCamera?.(camera)
  }, [camera])
  return (
    <Spring
      to={springProps}
      config={{ mass: 10, tension: 1000, friction: 100 /*, duration: 4000 */ }}
      loop
    >
      {(props) => (
        <Sprite anchor={0.5} texture={Texture.from(logo.src)} {...props} ref={setCameraTargetRef} />
      )}
    </Spring>
  )
}
