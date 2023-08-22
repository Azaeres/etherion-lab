import * as PIXI from 'pixi.js'
import { Graphics, Container, Text } from '@pixi/react'
import { ComponentProps, useCallback, useEffect, useState } from 'react'
import { useSpringValue } from 'react-spring'
import { Container as AnimatedContainer } from '@pixi/react-animated'
import { styles } from 'src/utils/pixi-styles'

export interface ButtonProps extends ComponentProps<typeof Container> {
  onPress?: PIXI.FederatedEventHandler<PIXI.FederatedPointerEvent> | null
  text?: string
}

export default function Button(props: ButtonProps) {
  const { onPress, x = 0, y = 0, width = 100, height = 50, text } = props
  const [engaged, setEngaged] = useState(false)
  const opacity = useSpringValue(0.0)

  const engageButton = useCallback(() => {
    setEngaged(true)
  }, [])
  const disengageButton = useCallback(() => {
    setEngaged(false)
  }, [])
  const activate = useCallback(
    (event: PIXI.FederatedPointerEvent) => {
      engaged && onPress?.(event)
    },
    [engaged, onPress]
  )
  useEffect(() => {
    if (engaged) {
      opacity.start(1.0)
    } else {
      opacity.start(0.0)
    }
  }, [engaged, opacity])
  const drawNormal = useCallback(
    (g: PIXI.Graphics) => {
      g.clear()
      g.lineStyle(4, 0xffffff, 1)
      g.beginFill(0x4400ff, 0.25)
      g.drawRoundedRect(x, y, width, height, 15)
      g.endFill()
    },
    [height, width, x, y]
  )
  const drawActive = useCallback(
    (g: PIXI.Graphics) => {
      g.clear()
      g.beginFill(0xffffff, 1.0)
      g.drawRoundedRect(x, y, width, height, 15)
      g.beginFill(0xffffff, 0.14)
      g.lineStyle(0, 0xffffff, 0)
      g.drawRoundedRect(x - 12, y - 10, width + 24, height + 20, 15)
      g.endFill()
    },
    [height, width, x, y]
  )
  return (
    <>
      <Graphics
        onpointerdown={engageButton}
        onpointerup={activate}
        onpointerout={disengageButton}
        // onpointerover={handleEvent}
        eventMode="static"
        cursor="pointer"
        draw={drawNormal}
      />
      <Container x={x + width / 2} y={y + height / 2} width={width} height={height}>
        <Text text={text} anchor={0.5} style={styles.body} />
      </Container>
      <AnimatedContainer alpha={opacity}>
        <Graphics draw={drawActive} />
        <Container x={x + width / 2} y={y + height / 2} width={width} height={height}>
          <Text text={text} anchor={0.5} style={styles.darkBody} />
        </Container>
      </AnimatedContainer>
    </>
  )
}
