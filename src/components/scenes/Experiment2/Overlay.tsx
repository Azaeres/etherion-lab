import { Graphics } from '@pixi/react'
import { FederatedEventHandler, FederatedPointerEvent, Graphics as PixiGraphics } from 'pixi.js'
import { useCallback } from 'react'
import { OPTIONS } from 'src/components/PixiStage'
import { emitMessage } from './events'

export interface OverlayProps {
  onPress?: FederatedEventHandler<FederatedPointerEvent> | null
}

export default function Overlay(props: OverlayProps) {
  const { onPress = () => {} } = props
  const click = useCallback((event: KeyboardEvent | MouseEvent) => {
    emitMessage(event)
  }, [])
  return (
    <Graphics
      onpointertap={onPress}
      onpointerdown={click}
      onpointerup={click}
      onpointerout={click}
      eventMode="static"
      draw={(g: PixiGraphics) => {
        const fill = 0x000000
        const alpha = 0.0001
        g.clear()
        g.beginFill(fill, alpha)
        g.drawRect(0, 0, OPTIONS.width, OPTIONS.height)
        g.endFill()
      }}
    />
  )
}
