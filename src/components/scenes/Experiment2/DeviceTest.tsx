import { Container as PixiContainer } from 'pixi.js'
import { Container, Text } from '@pixi/react'
import { useMediaQuery } from 'react-responsive'
import { styles } from 'src/utils/pixi-styles'

const lineHeight = 40
export default function DeviceTest(props: Partial<PixiContainer>) {
  const { x = 0, y = 0 } = props
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)',
  })
  const isBigScreen = useMediaQuery({ query: '(min-width: 1824px)' })
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' })
  const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' })
  return (
    <Container x={x} y={y}>
      <Text text="Device Test!" y={lineHeight} style={styles.body} />
      {isDesktopOrLaptop && (
        <Text text="You are a desktop or laptop" y={lineHeight * 2} style={styles.body} />
      )}
      {isBigScreen && <Text text="You have a huge screen" y={lineHeight * 3} style={styles.body} />}
      {isTabletOrMobile && (
        <Text text="You are a tablet or mobile phone" y={lineHeight * 4} style={styles.body} />
      )}
      <Text
        text={`You are in ${isPortrait ? 'portrait' : 'landscape'} orientation`}
        y={lineHeight * 5}
        style={styles.body}
      />
      {isRetina && <Text text="You are retina" y={lineHeight * 6} style={styles.body} />}
    </Container>
  )
}
