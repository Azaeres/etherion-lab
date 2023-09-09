import { Graphics, useTick } from '@pixi/react'
import { useCallback, useMemo, useState } from 'react'
import { Graphics as PixiGraphics } from 'pixi.js'
import { Meters, Pixels, Vec2Meters, metersFromPx, pxFromMeters } from 'src/utils/physics'
import { useCameraVelocityUpdateListener } from '../events'
import { Vec2 } from 'planck'

const CULLING_DISTANCE = metersFromPx(5000 as Pixels)

export interface DustProps {
  id: string
  x: Meters
  y: Meters
  destroy?: () => void
  cameraPosition?: Vec2Meters
  cullingDistance?: Meters
}

export default function Dust(props: DustProps) {
  const { x, y, destroy, cameraPosition, cullingDistance } = props
  const positionVector = useMemo(() => {
    return new Vec2(-x, -y) as Vec2Meters
  }, [x, y])
  const update = useCallback(() => {
    if (destroy) {
      const isSafe = isPositionWithinCameraBounds(positionVector, cameraPosition, cullingDistance)
      if (!isSafe) {
        destroy()
      }
    }
  }, [cameraPosition, cullingDistance, destroy, positionVector])
  useTick(update)
  return <DustGraphic x={x} y={y} />
}

interface DustGraphicProps {
  x: Meters
  y: Meters
}

const SCALAR = 0.05

function DustGraphic(props: DustGraphicProps) {
  const { x, y } = props
  // We simulate a motion blur effect by factoring in the camera's velocity.
  const [cameraVelocity, setCameraVelocity] = useState<Vec2Meters>()
  useCameraVelocityUpdateListener(setCameraVelocity)
  const drawDust = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      if (cameraVelocity) {
        const posX = pxFromMeters(x)
        const posY = pxFromMeters(y)

        // Draw an oversized dust graphic for debug purposes.
        // const bulletSize = 12
        // g.beginFill('#fff', 1)
        // g.drawRoundedRect(posX, posY, bulletSize, bulletSize, bulletSize)
        // g.endFill()

        g.beginFill('#fff', 1.0)
        g.lineStyle(12, '#777', 0.55)
        g.moveTo(posX, posY)
        g.lineTo(
          pxFromMeters((x - cameraVelocity.x * SCALAR) as Meters),
          pxFromMeters((y + cameraVelocity.y * SCALAR) as Meters)
        )
        g.endFill()
      }
    },
    [cameraVelocity, x, y]
  )
  return <Graphics draw={drawDust} anchor={0.5} />
}

function isPositionWithinCameraBounds(
  position?: Vec2Meters,
  cameraPosition?: Vec2Meters,
  cullingDistance: Meters = CULLING_DISTANCE
) {
  // console.log(
  //   'isPositionWithinCameraBounds  > position, cameraPosition, cullingDistance:',
  //   position,
  //   cameraPosition,
  //   cullingDistance
  // )
  if (cameraPosition && position) {
    const horizDistance = Math.abs(position.x - cameraPosition.x)
    const vertDistance = Math.abs(position.y + cameraPosition.y)
    // console.log(' > horizDistance, vertDistance:', horizDistance, vertDistance)
    const horizSafe = horizDistance <= cullingDistance
    const vertSafe = vertDistance <= cullingDistance
    // console.log(' > horizSafe, vertSafe:', horizSafe, vertSafe)
    return horizSafe && vertSafe
  } else {
    return null
  }
}
