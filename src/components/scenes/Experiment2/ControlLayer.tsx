import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import { FederatedPointerEvent } from 'pixi.js'
import { OPTIONS } from 'src/components/PixiStage'
import { useCallback, useState } from 'react'
import MobileView from './MobileView'
import Overlay from './Overlay'
import Button, { radiansFromDegrees } from './Button'
import {
  emitMoveActivate,
  emitMoveDisengage,
  emitMoveEngage,
  emitAttackActivate,
  emitAttackDisengage,
  emitAttackEngage,
} from './Button/events'
import DesktopView from './DesktopView'
import { Container, Text } from '@pixi/react'
import Dpad from './Dpad'
import { styles } from 'src/utils/pixi-styles'
import { usePlayerAvatarSpeedUpdateListener } from '../Experiment3/PrototypeShip/events'
import { Meters } from 'src/utils/physics'
import { usePeerCountUpdateListener } from '../Experiment3/events'
// import { PeerId } from '../Experiment3/hooks/usePeerbitDatabase'

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

export interface ControlLayerProps {
  peerId?: string
}

export default function ControlLayer(props: ControlLayerProps) {
  const { peerId } = props
  const navigate = useNextjsNavigate()
  const moveEngageAction = useCallback((event: FederatedPointerEvent) => {
    emitMoveEngage(event)
  }, [])
  const moveDisengageAction = useCallback((event: FederatedPointerEvent) => {
    emitMoveDisengage(event)
  }, [])
  const moveActivateAction = useCallback((event: FederatedPointerEvent) => {
    emitMoveActivate(event)
  }, [])
  const attackEngageAction = useCallback((event: FederatedPointerEvent) => {
    emitAttackEngage(event)
  }, [])
  const attackDisengageAction = useCallback((event: FederatedPointerEvent) => {
    emitAttackDisengage(event)
  }, [])
  const attackActivateAction = useCallback((event: FederatedPointerEvent) => {
    emitAttackActivate(event)
  }, [])
  const [speed, setSpeed] = useState(0.0 as Meters)
  usePlayerAvatarSpeedUpdateListener(setSpeed)
  const [peerCounter, setPeerCounter] = useState(0)
  usePeerCountUpdateListener(setPeerCounter)
  return (
    <>
      {peerCounter !== 0 && (
        <>
          <Text text={`Peer ID: ${peerId}`} style={styles.smallBody} x={60} y={180} />
          <Text text={`Peers: ${peerCounter.toString()}`} style={styles.smallBody} x={60} y={240} />
        </>
      )}
      <Text
        text={`Speed: ${speed.toFixed(2)}`}
        style={styles.smallBody}
        x={OPTIONS.width / 2 - 140}
        y={OPTIONS.height - 100}
      />
      <DesktopView>
        <Overlay />
        <Button
          text="&equiv; Menu"
          x={OPTIONS.width - ACTION_BUTTON_SIZE - 200}
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
            onEngage={attackEngageAction}
            onDisengage={attackDisengageAction}
            onActivate={attackActivateAction}
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
        <Dpad />
      </MobileView>
    </>
  )
}
