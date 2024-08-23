import { Graphics } from '@pixi/react'
import { FederatedEventHandler, FederatedPointerEvent, Graphics as PixiGraphics } from 'pixi.js'
import { useCallback } from 'react'
import { OPTIONS } from './OPTIONS'

export interface OverlayProps {
  onPointerDown?: FederatedEventHandler<FederatedPointerEvent> | null
  onPointerUp?: FederatedEventHandler<FederatedPointerEvent> | null
}

const noop = () => {}

export default function Overlay({ onPointerDown, onPointerUp }: OverlayProps) {
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
      onpointerdown={onPointerDown ?? noop}
      onpointerup={onPointerUp ?? noop}
      eventMode="dynamic"
      draw={draw}
    />
  )
}
