import { ParallaxCameraContext } from 'pixi-react-parallax'
import { OPTIONS } from './PixiStage'
import { Text, useTick } from '@pixi/react'
import { useCallback, useContext, useState } from 'react'
import useFpsMeasurement from 'src/app/hooks/useFpsMeasurement'
import { styles } from 'src/utils/pixi-styles'
import { Vec2 } from 'planck'
import { metersFromPx } from 'src/utils/physics'

export default function DebugIndicator() {
  const fps = useFpsMeasurement()
  const camera = useContext(ParallaxCameraContext)
  const [cameraPosition, setCameraPosition] = useState<Vec2 | undefined>()
  const update = useCallback(() => {
    if (camera) {
      setCameraPosition(new Vec2(camera.x, camera.y))
    }
  }, [camera])
  useTick(update)
  return (
    <>
      <Text
        text={`Camera: ${getPositionString(cameraPosition)}`}
        style={styles.smallBody}
        x={OPTIONS.width / 2 - 1200}
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
    return `[${metersFromPx(position.x).toFixed(2)}, ${metersFromPx(position.y).toFixed(2)}]`
  } else {
    return ''
  }
}
