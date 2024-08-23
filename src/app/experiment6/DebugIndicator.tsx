import { Text } from '@pixi/react'
import useFpsMeasurement from 'src/app/hooks/useFpsMeasurement'
import { styles } from 'src/utils/pixi-styles'
import { OPTIONS } from './OPTIONS'

export default function DebugIndicator() {
  const fps = useFpsMeasurement()
  return (
    <>
      <Text
        text={`Etherion Lab v${process.env.NEXT_PUBLIC_APP_VERSION}`}
        style={styles.smallBody}
        x={OPTIONS.width - 600}
        y={OPTIONS.height - 60}
      />
      <Text
        text={`FPS: ${fps === null ? '' : fps.toFixed(2)}`}
        style={styles.smallBody}
        x={OPTIONS.width - 220}
        y={OPTIONS.height - 60}
      />
    </>
  )
}
