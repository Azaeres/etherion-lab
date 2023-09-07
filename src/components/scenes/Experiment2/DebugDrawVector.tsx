import { Graphics } from '@pixi/react'
import { useCallback } from 'react'
import { Graphics as PixiGraphics } from 'pixi.js'
import { Meters, Vec2Meters, pxFromMeters } from 'src/utils/physics'

export interface DebugDrawVectorProps {
  trackingVector?: Vec2Meters
  origin?: Vec2Meters
  scale?: number
  color?: string
}

export default function DebugDrawVector(props: DebugDrawVectorProps) {
  const { trackingVector, origin, scale = 1.0, color = '#fff' } = props
  const drawHeadingVector = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      if (trackingVector && origin) {
        g.beginFill(color, 1.0)
        g.lineStyle(24, color, 1.0)
        g.moveTo(pxFromMeters(origin.x), pxFromMeters(-origin.y as Meters))
        g.lineTo(
          pxFromMeters((origin.x + trackingVector.x * scale) as Meters),
          pxFromMeters((-origin.y - trackingVector.y * scale) as Meters)
        )
        g.endFill()
      }
    },
    [origin, trackingVector, scale, color]
  )
  return <Graphics draw={drawHeadingVector} />
}
