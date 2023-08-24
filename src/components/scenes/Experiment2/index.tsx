'use client'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import Logo from 'src/components/Logo'
import stars from '../Experiment1/assets/Stars-full.webp'
import { FederatedPointerEvent, Texture } from 'pixi.js'
import { Sprite } from '@pixi/react-animated'
import { OPTIONS } from 'src/components/PixiStage'
import { useCallback, useMemo } from 'react'
import { ParallaxCameraProvider, ParallaxLayer } from 'pixi-react-parallax'
import PlayerAvatar from './PlayerAvatar'
import PlanckWorldProvider from './PlanckWorldProvider'
import PlanckBody from './PlanckBody'
import { Box, Vec2 } from 'planck'
// import DeviceTest from './DeviceTest'
import MobileView from './MobileView'
// import { styles } from 'src/utils/pixi-styles'
import Overlay from './Overlay'
import Button, { radiansFromDegrees } from './Button'
import { emitMoveActivate, emitMoveDisengage, emitMoveEngage } from './Button/events'
import DesktopView from './DesktopView'
import { Container } from '@pixi/react'

const getRandomPosition = () => {
  return {
    x: Math.random() * OPTIONS.width,
    y: Math.random() * OPTIONS.height,
  } as const
}

// The radius of the rounded corners.
// This should be relatively high to form a circular button.
const ACTION_BUTTON_RADIUS = 160

// Higher radii causes smaller buttons here.
const ACTION_BUTTON_SIZE = OPTIONS.height / 3 - ACTION_BUTTON_RADIUS
const SECONDARY_ACTION_BUTTON_HORIZ_OFFSET = 230

const actionButtonBackground = {
  angle: radiansFromDegrees(90),
  fromColor: '#00a',
  toColor: '#31c',
  alpha: 0.2,
} as const

const actionButtonOutlineStyle = {
  width: 4,
  color: '#aaaaff',
  alpha: 0.3,
} as const

export default function Experiment1() {
  const navigate = useNextjsNavigate()
  const logo1 = useMemo(getRandomPosition, [])
  const logo2 = useMemo(getRandomPosition, [])
  const logo3 = useMemo(getRandomPosition, [])
  const logo4 = useMemo(getRandomPosition, [])
  const moveEngageAction = useCallback((event: FederatedPointerEvent) => {
    // console.log('emitting move engage  event:', event.type)
    emitMoveEngage(event)
  }, [])
  const moveDisengageAction = useCallback((event: FederatedPointerEvent) => {
    emitMoveDisengage(event)
  }, [])
  const moveActivateAction = useCallback((event: FederatedPointerEvent) => {
    emitMoveActivate(event)
  }, [])
  return (
    <>
      <PlanckWorldProvider gravityY={-80}>
        <ParallaxCameraProvider movementDamping={2.0}>
          <ParallaxLayer zIndex={-18000}>
            <Sprite texture={Texture.from(stars.src)} x={0} y={0} anchor={0.5} scale={65} />
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
      {/* <DeviceTest y={310} />
      <MobileView>
        <Text text="This text can only be seen on MOBILE" y={200} style={styles.body} />
      </MobileView>
      <DesktopView>
        <Text text="This text can only be seen on DESKTOP" y={200} style={styles.body} />
      </DesktopView> */}
      <DesktopView>
        <Overlay />
        <Button
          text="&equiv; Menu"
          x={100}
          y={50}
          width={ACTION_BUTTON_SIZE + 100}
          height={120}
          onPress={navigate('/')}
          background={{ angle: radiansFromDegrees(90), fromColor: '#3300aa', alpha: 0.4 }}
          outlineStyle={actionButtonOutlineStyle}
        />
      </DesktopView>
      <MobileView>
        <Button
          text="&equiv;"
          x={OPTIONS.width - ACTION_BUTTON_SIZE - SECONDARY_ACTION_BUTTON_HORIZ_OFFSET}
          y={30}
          width={ACTION_BUTTON_SIZE / 1.5}
          height={ACTION_BUTTON_SIZE / 1.5}
          radius={ACTION_BUTTON_RADIUS / 2}
          onPress={navigate('/')}
          background={actionButtonBackground}
          outlineStyle={actionButtonOutlineStyle}
        />
        <Container y={70}>
          <Button
            text="Move"
            x={OPTIONS.width - ACTION_BUTTON_SIZE - 100}
            y={50}
            width={ACTION_BUTTON_SIZE}
            height={ACTION_BUTTON_SIZE}
            radius={ACTION_BUTTON_RADIUS}
            background={{
              ...actionButtonBackground,
              fromColor: '#037',
              toColor: '#07a',
              alpha: 0.3,
            }}
            outlineStyle={actionButtonOutlineStyle}
            onEngage={moveEngageAction}
            onDisengage={moveDisengageAction}
            onActivate={moveActivateAction}
          />
          <Button
            text="A"
            x={OPTIONS.width - ACTION_BUTTON_SIZE - SECONDARY_ACTION_BUTTON_HORIZ_OFFSET}
            y={210} // 220 is 2nd position for the secondary action buttons.
            width={ACTION_BUTTON_SIZE / 1.5}
            height={ACTION_BUTTON_SIZE / 1.5}
            radius={ACTION_BUTTON_RADIUS / 2}
            // onPress={navigate('/')}
            background={actionButtonBackground}
            outlineStyle={actionButtonOutlineStyle}
          />
          <Button
            text="Attack"
            x={OPTIONS.width - ACTION_BUTTON_SIZE - 100}
            y={50 + ACTION_BUTTON_SIZE + 50}
            width={ACTION_BUTTON_SIZE}
            height={ACTION_BUTTON_SIZE}
            radius={ACTION_BUTTON_RADIUS}
            background={{
              ...actionButtonBackground,
              fromColor: '#307',
              toColor: '#70a',
              alpha: 0.35,
            }}
            outlineStyle={actionButtonOutlineStyle}
          />
          <Button
            text="B"
            x={OPTIONS.width - ACTION_BUTTON_SIZE - SECONDARY_ACTION_BUTTON_HORIZ_OFFSET}
            y={460} // 220 is 2nd position for the secondary action buttons.
            width={ACTION_BUTTON_SIZE / 1.5}
            height={ACTION_BUTTON_SIZE / 1.5}
            radius={ACTION_BUTTON_RADIUS / 2}
            // onPress={navigate('/')}
            background={actionButtonBackground}
            outlineStyle={actionButtonOutlineStyle}
          />
          <Button
            text="Guard"
            x={OPTIONS.width - ACTION_BUTTON_SIZE - 100}
            y={50 + ACTION_BUTTON_SIZE + 50 + ACTION_BUTTON_SIZE + 50}
            width={ACTION_BUTTON_SIZE}
            height={ACTION_BUTTON_SIZE}
            radius={ACTION_BUTTON_RADIUS}
            background={{
              ...actionButtonBackground,
              fromColor: '#a07777',
              toColor: '#aac8aa',
              alpha: 0.2,
            }}
            outlineStyle={actionButtonOutlineStyle}
          />
          <Button
            text="C"
            x={OPTIONS.width - ACTION_BUTTON_SIZE - SECONDARY_ACTION_BUTTON_HORIZ_OFFSET}
            y={710} // 220 is 2nd position for the secondary action buttons.
            width={ACTION_BUTTON_SIZE / 1.5}
            height={ACTION_BUTTON_SIZE / 1.5}
            radius={ACTION_BUTTON_RADIUS / 2}
            // onPress={navigate('/')}
            background={actionButtonBackground}
            outlineStyle={actionButtonOutlineStyle}
          />
        </Container>
      </MobileView>
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
