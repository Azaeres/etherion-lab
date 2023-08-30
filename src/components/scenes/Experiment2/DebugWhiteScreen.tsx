import { Graphics } from '@pixi/react'
import { Graphics as PixiGraphics } from 'pixi.js'
import { useCallback } from 'react'
import { OPTIONS } from 'src/components/PixiStage'

export interface DebugWhiteScreenProps {}

export default function DebugWhiteScreen() {
  const draw = useCallback((g: PixiGraphics) => {
    const fill = 0xffffff
    const alpha = 1.0
    g.clear()
    g.beginFill(fill, alpha)
    g.drawRect(0, 0, OPTIONS.width, OPTIONS.height)
    g.endFill()
  }, [])
  return <Graphics draw={draw} />
}
