import { useState } from 'react'
import * as PIXI from 'pixi.js'
import { OPTIONS } from './PixiStage'
import useThrottledCallback from 'src/app/hooks/useThrottledCallback'
import { Text, useTick } from '@pixi/react'

export default function DebugIndicator() {
  const [fps, setFps] = useState(0)
  const throttled = useThrottledCallback(500, () => {
    setFps(PIXI.Ticker.shared.FPS)
  })
  useTick(throttled)
  return (
    <>
      <Text
        text={`Etherion Lab v${process.env.NEXT_PUBLIC_APP_VERSION}`}
        style={
          new PIXI.TextStyle({
            dropShadow: true,
            dropShadowAlpha: 0.8,
            fill: '0xcccccc',
            fontSize: 38,
            fontFamily: 'Arial',
            fontWeight: 'bold',
          })
        }
        x={OPTIONS.width - 600}
        y={OPTIONS.height - 60}
      />
      <Text
        text={`FPS: ${fps.toLocaleString()}`}
        style={
          new PIXI.TextStyle({
            dropShadow: true,
            dropShadowAlpha: 0.8,
            fill: '0xcccccc',
            fontSize: 38,
            fontFamily: 'Arial',
            fontWeight: 'bold',
          })
        }
        x={OPTIONS.width - 200}
        y={OPTIONS.height - 60}
      />
    </>
  )
}
