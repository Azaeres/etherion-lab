'use client'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import Logo from 'src/components/Logo'
import stars from '../Experiment1/assets/Stars-full.webp'
import * as PIXI from 'pixi.js'
import { Sprite } from '@pixi/react-animated'
import { OPTIONS } from 'src/components/PixiStage'
import { useMemo } from 'react'
import { ParallaxCameraProvider, ParallaxLayer } from 'pixi-react-parallax'
import { Text } from '@pixi/react'
import PlayerAvatar from './PlayerAvatar'
import PlanckWorldProvider from './PlanckWorldProvider'
import PlanckBody from './PlanckBody'
import planck from 'planck'
// import Button from './Button/Button'
import DeviceTest from './DeviceTest'
import MobileView from './MobileView'
import { styles } from 'src/utils/pixi-styles'
import DesktopView from './DesktopView'
import Overlay from './Overlay'

const getRandomPosition = () => {
  return {
    x: Math.random() * OPTIONS.width,
    y: Math.random() * OPTIONS.height,
  }
}

export default function Experiment1() {
  const navigate = useNextjsNavigate()
  const logo1 = useMemo(getRandomPosition, [])
  const logo2 = useMemo(getRandomPosition, [])
  const logo3 = useMemo(getRandomPosition, [])
  const logo4 = useMemo(getRandomPosition, [])
  return (
    <>
      <PlanckWorldProvider gravityY={-80}>
        <ParallaxCameraProvider movementDamping={2.0}>
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
            <PlayerAvatar x={2400} />
            <Ground />
          </ParallaxLayer>
          <ParallaxLayer zIndex={100}>
            {/* Don't exceed the focal length (default 300) or it'll pass behind the camera. Technically, it gets mirrored, and looks weird. */}
            {/* Very close! */}
            <Logo {...logo4} />
          </ParallaxLayer>
        </ParallaxCameraProvider>
      </PlanckWorldProvider>
      {/* <Button>
        <Text text="thing" />
      </Button> */}
      <DeviceTest y={310} />
      <MobileView>
        <Text text="This text can only be seen on MOBILE" y={200} style={styles.body} />
      </MobileView>
      <DesktopView>
        <Text text="This text can only be seen on DESKTOP" y={200} style={styles.body} />
      </DesktopView>
      <Overlay />
      <Text
        text="⬅️ Back"
        x={100}
        y={50}
        scale={2}
        onpointerup={navigate('/')}
        cursor="pointer"
        eventMode="static"
        style={new PIXI.TextStyle({ fill: '0xcccccc', fontSize: '38px' })}
      />
    </>
  )
}

const groundFixtures = [
  {
    shape: planck.Box(50.0, 1.0),
    density: 0.0,
    // friction: 0.3,
  },
] as const

function Ground() {
  return (
    <PlanckBody
      bodyDef={{
        type: 'static',
        position: planck.Vec2(0.0, -30.0),
      }}
      fixtureDefs={groundFixtures}
      debugDraw={true}
    ></PlanckBody>
  )
}
