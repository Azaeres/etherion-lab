import { Graphics } from '@pixi/react'
import { Graphics as PixiGraphics, Texture } from 'pixi.js'
import { useCallback } from 'react'

export interface BoundingBoxProps {
  x: number
  y: number
  width: number
  height: number
  anchor?: number
}

export default function BoundingBox({ x, y, width, height, anchor }: BoundingBoxProps) {
  const draw = useCallback(
    (g: PixiGraphics) => {
      // const fill = 0x000000
      const alpha = 0.25 // 0.0001
      g.clear()
      if (typeof anchor === 'number') {
        g.pivot.set(anchor * width, anchor * height) // Set the anchor
      }
      g.beginTextureFill({
        alpha,
        texture: getGlowTexture(x - 20, y - 20, width + 40, height + 40, 90),
      })
      // g.beginFill(fill, alpha)
      g.drawRect(x - 90, y - 90, width + 180, height + 180)
      g.endFill()
    },
    [height, width, x, y, anchor]
  )

  return <Graphics draw={draw} />
}

function getGlowTexture(
  // from: string,
  // to: string,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 0
) {
  const c = document.createElement('canvas')
  c.width = x + width + 80
  c.height = y + height + 80
  const ctx = c.getContext('2d')
  if (ctx) {
    ctx.shadowColor = '#000'
    ctx.shadowBlur = 60
    ctx.shadowOffsetX = 0

    ctx.shadowOffsetY = 0
    ctx.fillStyle = '#000'
    // ctx.roundRect(x + 60, y + 60, width - 120, height - 120, radius)
    // ctx.fill()

    // Draw multiple shadows to make it darker
    for (let i = 0; i < 6; i++) {
      ctx.roundRect(x + 80, y + 80, width - 160, height - 160, radius)
      ctx.fill()
    }
  }

  return Texture.from(c)
}
