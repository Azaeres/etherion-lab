import { Graphics } from '@pixi/react'
import { FederatedEventHandler, FederatedPointerEvent, Graphics as PixiGraphics } from 'pixi.js'
import { useCallback } from 'react'
import { OPTIONS } from 'src/components/PixiStage'
import { emitOverlayClick } from './events'
import { Vec2 } from 'planck'
import { emitDPadVectorUpdate } from '../Dpad/events'

export interface OverlayProps {
  onPress?: FederatedEventHandler<FederatedPointerEvent> | null
}

const centerPoint = new Vec2(OPTIONS.width / 2, OPTIONS.height / 2)

export default function Overlay(props: OverlayProps) {
  const { onPress = () => {} } = props
  const click = useCallback((event: KeyboardEvent | MouseEvent) => {
    emitOverlayClick(event)
  }, [])
  const trackMouse = useCallback((event: FederatedPointerEvent) => {
    const mousePoint = new Vec2(event.globalX, event.globalY)
    const vector = mousePoint.sub(centerPoint)
    vector.mul(0.5)
    emitDPadVectorUpdate(vector)
  }, [])
  const draw = useCallback((g: PixiGraphics) => {
    const fill = 0x000000
    const alpha = 0.0001
    g.clear()
    g.beginFill(fill, alpha)
    g.drawRect(0, 0, OPTIONS.width, OPTIONS.height)
    g.endFill()
  }, [])
  return (
    <Graphics
      onpointertap={onPress}
      onpointerdown={click}
      onpointerup={click}
      onpointerout={click}
      onglobalmousemove={trackMouse}
      eventMode="static"
      draw={draw}
    />
  )
}
