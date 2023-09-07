import { OPTIONS } from './PixiStage'
import { Text } from '@pixi/react'
import { useState } from 'react'
import useFpsMeasurement from 'src/app/hooks/useFpsMeasurement'
import { styles } from 'src/utils/pixi-styles'
import { Vec2 } from 'planck'
import { Vec2Meters } from 'src/utils/physics'
import { useCameraPositionUpdateListener } from './scenes/Experiment2/events'

export default function DebugIndicator() {
  const fps = useFpsMeasurement()
  const [cameraPosition, setCameraPosition] = useState<Vec2Meters>()
  useCameraPositionUpdateListener(setCameraPosition)
  return (
    <>
      <Text
        text={`Camera position: ${getPositionString(cameraPosition)}`}
        style={styles.smallBody}
        x={OPTIONS.width / 2 - 1600}
        y={OPTIONS.height / 2 - 60}
        // x={0}
        // y={0}
      />
      <Text
        text={`Etherion Lab v${process.env.NEXT_PUBLIC_APP_VERSION}`}
        style={styles.smallBody}
        x={OPTIONS.width / 2 - 600}
        y={OPTIONS.height / 2 - 60}
      />
      <Text
        text={`FPS: ${fps === null ? '' : fps.toFixed(2)}`}
        style={styles.smallBody}
        x={OPTIONS.width / 2 - 220}
        y={OPTIONS.height / 2 - 60}
      />
    </>
  )
}

function getPositionString(position?: Vec2) {
  if (position) {
    return `[${position.x.toFixed(2)}, ${position.y.toFixed(2)}]`
  } else {
    return ''
  }
}
