import { Graphics } from '@pixi/react'
import { useCallback, useEffect, useState } from 'react'
import { FederatedPointerEvent, Graphics as PixiGraphics } from 'pixi.js'
import { OPTIONS } from 'src/components/PixiStage'
import { Vec2 } from 'planck'
import { emitDPadVectorUpdate } from './events'

const MARGIN = 40
const ANCHOR_SIZE = 60

export default function Dpad() {
  const [anchor, setAnchor] = useState<Vec2 | null>(null)
  const [trackingVector, setTrackingVector] = useState<Vec2 | null>(null)

  const engageButton = useCallback((event: FederatedPointerEvent) => {
    setAnchor(new Vec2(event.globalX, event.globalY))
    setTrackingVector(null)
  }, [])

  const disengageButton = useCallback(() => {
    setAnchor(null)
    setTrackingVector(null)
  }, [])

  const trackPointer = useCallback(
    (event: FederatedPointerEvent) => {
      if (anchor) {
        setTrackingVector(new Vec2(event.globalX - anchor.x, event.globalY - anchor.y))
      }
    },
    [anchor]
  )

  useEffect(() => {
    emitDPadVectorUpdate(trackingVector)
  }, [trackingVector])

  const drawPad = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      g.lineStyle(12, '#aaaaaa', anchor ? 0.32 : 0.15)
      g.beginFill('black', 0.0001)
      const squareSize = OPTIONS.height - MARGIN - MARGIN
      g.drawRoundedRect(MARGIN, MARGIN, squareSize, squareSize, 530)
      g.endFill()
    },
    [anchor]
  )
  const drawAnchorVector = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      if (anchor) {
        g.beginFill('#fff', 0.82)
        g.drawRoundedRect(
          anchor.x - ANCHOR_SIZE / 2,
          anchor.y - ANCHOR_SIZE / 2,
          ANCHOR_SIZE,
          ANCHOR_SIZE,
          ANCHOR_SIZE
        )
        g.endFill()
        if (trackingVector) {
          g.beginFill('#fff', 0.92)
          g.lineStyle(24, '#aaaaaa', 0.82)
          g.moveTo(anchor.x, anchor.y)
          g.lineTo(trackingVector.x + anchor.x, trackingVector.y + anchor.y)
          g.endFill()
        }
      }
    },
    [anchor, trackingVector]
  )
  return (
    <>
      <Graphics
        onpointerdown={engageButton}
        onpointerup={disengageButton}
        onpointerout={disengageButton}
        onpointermove={trackPointer}
        eventMode="static"
        cursor="pointer"
        draw={drawPad}
      />
      <Graphics draw={drawAnchorVector} />
    </>
  )
}
