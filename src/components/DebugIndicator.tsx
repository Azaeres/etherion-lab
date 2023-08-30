import { TextStyle } from 'pixi.js'
import { OPTIONS } from './PixiStage'
import { Text } from '@pixi/react'
import useFpsMeasurement from 'src/app/hooks/useFpsMeasurement'

export default function DebugIndicator() {
  const fps = useFpsMeasurement()
  return (
    <>
      <Text
        text={`Etherion Lab v${process.env.NEXT_PUBLIC_APP_VERSION}`}
        style={
          new TextStyle({
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
        text={`FPS: ${fps === null ? '' : fps.toFixed(2)}`}
        style={
          new TextStyle({
            dropShadow: true,
            dropShadowAlpha: 0.8,
            fill: '0xcccccc',
            fontSize: 38,
            fontFamily: 'Arial',
            fontWeight: 'bold',
          })
        }
        x={OPTIONS.width - 220}
        y={OPTIONS.height - 60}
      />
    </>
  )
}
