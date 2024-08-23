'use client'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import Logo from 'src/components/Logo'
import boy from './assets/sleeping_boy_kairen.jpg'
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
import useNextjsRouter from 'src/app/hooks/useNextjsRouter'

// TODO: Placeholder view for Experiment6.

const texture = Texture.from(logo.src)

const set = (): AnimatedLogoProps => ({
  x: Math.random() * OPTIONS.width,
  y: Math.random() * OPTIONS.height,
  rotation: Math.random() * 10,
  alpha: Math.random(),
  // scale: Math.max(1, Math.random() * 4),
})

const getRandomPosition = () => {
  return {
    x: Math.random() * OPTIONS.width,
    y: Math.random() * OPTIONS.height,
  }
}

export default function Experiment6() {
  const navigate = useNextjsNavigate()
  const navigation = useNextjsRouter()
  console.log('Experiment6 custom route > navigation:', navigation)
  const [transform, setTransform] = useState<AnimatedLogoProps>(set)
  // const [, setCameraTargetRef] = useParallaxCameraRef()
  // const camera = useContext(ParallaxCameraContext)
  const [camera, setCamera] = useState<ParallaxCamera | null>()
  const onCamera = useCallback((camera: ParallaxCamera | null) => {
    console.log('onCamera  > camera:', camera)
    setCamera(camera)
  }, [])
  console.log('Experiment6 barbaz render > camera:', camera)
  const pointerDown = useCallback(() => {
    console.log('pointerdown  : camera:', camera)
    camera?.shake(40, 0.2)
  }, [camera])
  const pointerUp = useCallback(() => {
    console.log('pointerup  :')
    setTransform(set)
    // TODO: Add client-side route to /experiment6/zhariel (and the other books)
    // navigate('/experiment6/zhariel')()
  }, [])
  // const click = useCallback(() => {
  //   camera?.shake(40, 0.2)
  //   setTransform(set)
  // }, [])
  const logo1 = useMemo(getRandomPosition, [])
  const logo2 = useMemo(getRandomPosition, [])
  const logo3 = useMemo(getRandomPosition, [])
  const logo4 = useMemo(getRandomPosition, [])
  return (
    <>
      <ParallaxCameraProvider>
        <ParallaxLayer zIndex={-18000}>
          <Sprite texture={Texture.from(boy.src)} x={0} y={0} anchor={0.5} scale={165} />
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
      {/* <Text
        text={`Click/tap anywhere to move the camera target.\nClick/tap on the camera target to also cause the camera to shake!`}
        x={100}
        y={200}
        scale={2}
        style={new TextStyle({ fill: '0xcccccc', fontSize: '22px' })}
      /> */}
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
  onCamera?: (ref: ParallaxCamera | null) => void
  alpha?: number
}

function AnimatedLogo(props: AnimatedLogoProps) {
  const springProps = { ...props }
  delete springProps.onCamera
  const [, setCameraTargetRef] = useParallaxCameraRef()
  const camera = useContext(ParallaxCameraContext)
  useEffect(() => {
    props.onCamera?.(camera)
  }, [camera, props])
  console.log('AnimatedLogo  > camera:', camera)
  // const click = useCallback(() => {
  //   console.log('click! :')
  //   camera?.shake(40, 0.2)
  // }, [camera])
  return (
    <Spring
      to={springProps}
      config={{ mass: 10, tension: 1000, friction: 100 /*, duration: 4000 */ }}
      loop={false}
    >
      {(props) => {
        console.log('props:', props)
        return (
          <Sprite
            anchor={0.5}
            texture={texture}
            {...props}
            // interactive={true}
            // onmouseenter={() => console.log('mouseenter')}
            // onclick={() => console.log('click')}
            // onmouseup={() => console.log('mouseup')}
            // onpointerdown={() => console.log('pointerdown')}
            // onpointerdown={click}
            // cursor="pointer"
            // eventMode="dynamic"
            ref={setCameraTargetRef}
          />
        )
      }}
    </Spring>
  )
}
