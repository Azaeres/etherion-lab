import { Graphics } from '@pixi/react'
import { useCallback, useEffect, useState } from 'react'
import { FederatedPointerEvent, Graphics as PixiGraphics } from 'pixi.js'
import { OPTIONS } from 'src/components/PixiStage'
import { Vec2 } from 'planck'
import { emitDPadVectorUpdate } from './events'

const MARGIN = 40
const ANCHOR_SIZE = 40

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
      g.lineStyle(12, '#000', anchor ? 0.24 : 0.1)
      g.beginFill('black', 0.0001)
      const squareSize = OPTIONS.height - MARGIN - MARGIN
      g.drawRoundedRect(MARGIN, MARGIN, squareSize, squareSize, 530)
      g.endFill()

      g.lineStyle(12, '#aaa', anchor ? 0.32 : 0.15)
      const innerSquareSize = OPTIONS.height - MARGIN - MARGIN - 20
      g.drawRoundedRect(MARGIN + 10, MARGIN + 10, innerSquareSize, innerSquareSize, 530)
    },
    [anchor]
  )
  const drawAnchorVector = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      if (anchor) {
        g.beginFill('#000', 0.1)
        g.drawRoundedRect(
          anchor.x - (ANCHOR_SIZE + 10) / 2,
          anchor.y - (ANCHOR_SIZE + 10) / 2,
          ANCHOR_SIZE + 10,
          ANCHOR_SIZE + 10,
          ANCHOR_SIZE + 10
        )
        g.endFill()
        g.beginFill('#ddd', 1)
        g.drawRoundedRect(
          anchor.x - ANCHOR_SIZE / 1.2 / 2,
          anchor.y - ANCHOR_SIZE / 1.2 / 2,
          ANCHOR_SIZE / 1.2,
          ANCHOR_SIZE / 1.2,
          ANCHOR_SIZE / 1.2
        )
        g.endFill()
        g.beginFill('#fff', 1)
        g.drawRoundedRect(
          anchor.x - ANCHOR_SIZE / 2.8 / 2,
          anchor.y - ANCHOR_SIZE / 2.8 / 2,
          ANCHOR_SIZE / 2.8,
          ANCHOR_SIZE / 2.8,
          ANCHOR_SIZE / 2.8
        )
        g.endFill()
        if (trackingVector) {
          g.beginFill('#fff', 1)
          g.drawRoundedRect(
            anchor.x + trackingVector.x - ANCHOR_SIZE / 2.8 / 2,
            anchor.y + trackingVector.y - ANCHOR_SIZE / 2.8 / 2,
            ANCHOR_SIZE / 2.8,
            ANCHOR_SIZE / 2.8,
            ANCHOR_SIZE / 2.8
          )
          g.endFill()

          g.beginFill('#fff', 0.92)
          g.lineStyle(22, '#ddd', 0.8)
          g.moveTo(anchor.x, anchor.y)
          g.lineTo(trackingVector.x + anchor.x, trackingVector.y + anchor.y)
          g.endFill()

          g.beginFill('#fff', 1.0)
          g.lineStyle(7, '#fff', 1)
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
