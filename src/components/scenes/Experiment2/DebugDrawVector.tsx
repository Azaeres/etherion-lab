import { Graphics } from '@pixi/react'
import { Vec2 } from 'planck'
import { useCallback } from 'react'
import { Graphics as PixiGraphics } from 'pixi.js'

export interface DebugDrawVectorProps {
  trackingVector?: Vec2
  origin?: Vec2
}

export default function DebugDrawVector(props: DebugDrawVectorProps) {
  const { trackingVector, origin } = props
  const drawHeadingVector = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      if (trackingVector && origin) {
        g.beginFill('#fff', 0.92)
        g.lineStyle(24, '#aaaaaa', 0.82)
        g.moveTo(origin.x, origin.y)
        g.lineTo(origin.x + trackingVector.x, origin.y + trackingVector.y)
        g.endFill()
      }
    },
    [origin, trackingVector]
  )
  return <Graphics draw={drawHeadingVector} />
}
