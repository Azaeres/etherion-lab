import { Graphics } from '@pixi/react'
import * as PIXI from 'pixi.js'
import { useCallback } from 'react'
import { OPTIONS } from 'src/components/PixiStage'
import { emitMessage } from './events'

export interface OverlayProps {
  onPress?: PIXI.FederatedEventHandler<PIXI.FederatedPointerEvent> | null
}

export default function Overlay(props: OverlayProps) {
  const { onPress } = props
  const click = useCallback((event: MouseEvent) => {
    emitMessage(event)
  }, [])
  return (
    <Graphics
      onpointertap={onPress}
      onpointerdown={click}
      onpointerup={click}
      onpointerout={click}
      eventMode="static"
      draw={(g: PIXI.Graphics) => {
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
