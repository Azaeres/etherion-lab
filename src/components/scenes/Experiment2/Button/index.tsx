import {
  FederatedEventHandler,
  FederatedPointerEvent,
  Graphics as PixiGraphics,
  Texture,
} from 'pixi.js'
import { Graphics, Container, Text } from '@pixi/react'
import { ComponentProps, useCallback, useEffect, useState } from 'react'
import { useSpringValue } from 'react-spring'
import { Container as AnimatedContainer } from '@pixi/react-animated'
import { styles } from 'src/utils/pixi-styles'

export interface ButtonProps extends ComponentProps<typeof Container> {
  onPress?: FederatedEventHandler<FederatedPointerEvent> | null
  text?: string
  radius?: number
  background?: ButtonBackgroundProps
  outlineStyle?: OutlineStyle
  onEngage?: (event: FederatedPointerEvent) => void
  onDisengage?: (event: FederatedPointerEvent) => void
  onActivate?: (event: FederatedPointerEvent) => void
}

export interface ButtonBackgroundProps {
  alpha?: number
  fromColor?: string
  toColor?: string
  angle?: number
}

export interface OutlineStyle {
  width?: number
  color?: string
  alpha?: number
}

export default function Button(props: ButtonProps) {
  const {
    onPress,
    x = 0,
    y = 0,
    width = 100,
    height = 50,
    text,
    radius = 15,
    background = {},
    outlineStyle = {},
    onEngage,
    onDisengage,
    onActivate,
  } = props
  const {
    alpha = 0.55,
    fromColor = '#2206cc',
    toColor = '#330066',
    angle = radiansFromDegrees(90),
  } = background
  const [engaged, setEngaged] = useState(false)
  const opacity = useSpringValue(0.0, { config: { duration: 100 } })

  const engageButton = useCallback(
    (event: FederatedPointerEvent) => {
      setEngaged(true)
      onEngage?.(event)
    },
    [onEngage]
  )
  const disengageButton = useCallback(
    (event: FederatedPointerEvent) => {
      setEngaged(false)
      onDisengage?.(event)
    },
    [onDisengage]
  )
  const activate = useCallback(
    (event: FederatedPointerEvent) => {
      engaged && onPress?.(event)
      setEngaged(false)
      onActivate?.(event)
    },
    [engaged, onActivate, onPress]
  )
  useEffect(() => {
    if (engaged) {
      opacity.start(1.0)
    } else {
      opacity.start(0.0)
    }
  }, [engaged, opacity])
  const drawNormal = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      g.lineStyle(
        outlineStyle.width || 4,
        outlineStyle.color || '#ffffff',
        outlineStyle.alpha || 1.0
      )
      g.beginTextureFill({
        alpha,
        texture: getGradientTexture(fromColor, toColor, x, y, width, height, angle),
      })
      g.drawRoundedRect(x, y, width, height, radius)
      g.endFill()
    },
    [
      alpha,
      angle,
      fromColor,
      height,
      outlineStyle.alpha,
      outlineStyle.color,
      outlineStyle.width,
      radius,
      toColor,
      width,
      x,
      y,
    ]
  )
  const drawActive = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      g.beginTextureFill({
        alpha: 1,
        texture: getGlowTexture(x - 40, y - 40, width + 80, height + 80, radius),
      })
      g.drawRect(x - 40, y - 40, width + 80, height + 80)
      g.endFill()
    },
    [height, radius, width, x, y]
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
    ctx.shadowColor = '#fff'
    ctx.shadowBlur = 40
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.fillStyle = '#fff'
    ctx.roundRect(x + 40, y + 40, width - 80, height - 80, radius)
    ctx.fill()
  }

  return Texture.from(c)
}

function getGradientTexture(
  from: string,
  to: string,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number = radiansFromDegrees(0)
) {
  const c = document.createElement('canvas')
  c.width = x + width
  c.height = y + height
  const ctx = c.getContext('2d')

  // Note: All angle values in here are in radians.
  // The rect is the area to fill with the gradient.
  // `centerPoint` is the centerpoint of the rect.
  const centerPoint = { x: width / 2, y: height / 2 }
  // `rectAngle` is the angle from the centerpoint of the rect to its upper-right corner.
  const rectAngle = Math.atan(height / width)
  // The given `angle` can be any number, negative, multiples of (2 * Math.PI), whatever.
  // `gradientAngle` projects that angle onto a (2 * Math.PI) circle, so it must be within 0 and (2 * Math.PI).
  const gradientAngle = angle % (2 * Math.PI)
  // `isHorizontal` is true when the gradientAngle intersects with the horizontal edges of the rect.
  // It's false if the gradientAngle intersects with the vertical edges.
  const isHorizontal =
    angleIsInRange(gradientAngle, rectAngle, Math.PI - rectAngle) ||
    angleIsInRange(gradientAngle, Math.PI + rectAngle, 2 * Math.PI - rectAngle)
  // `length` is how long the line is between the origin and the point the gradient line intersects with the rect edge.
  // It's calculated differently based on whether that intersection point lands on a horizontal or vertical edge.
  // The main reason is because a gradient line that is parallel to the vertical edge doesn't intersect vertically; only horizontally.
  // The closer the gradient line comes to being vertically parallel, the more inaccurately the vertical intersection point is derived.
  // Vice versa is true for the horizontal.
  // The solution is to just calculate the horizontal in a slightly different way to the vertical.
  const length = isHorizontal
    ? getHorizontalLength(gradientAngle, height)
    : getVerticalLength(gradientAngle, width)
  // `createLinearGradient()` expects the coordinates of 2 points on the gradient line.
  // Up till now, we haven't applied the centerpoint offset, or the rect position offset.
  const x1 = centerPoint.x + x
  const y1 = centerPoint.y + y
  const x2 = length * Math.cos(gradientAngle) + centerPoint.x + x
  const y2 = length * Math.sin(gradientAngle) + centerPoint.y + y

  const grd = ctx?.createLinearGradient(x1, y1, x2, y2)
  if (ctx && grd) {
    grd.addColorStop(0, from)
    grd.addColorStop(1, to)
    ctx.fillStyle = grd
    ctx.fillRect(x, y, width, height)
  }
  return Texture.from(c)
}

function getVerticalLength(angle: number, width: number) {
  return Math.abs(width / 2 / Math.cos(angle))
}

function getHorizontalLength(angle: number, height: number) {
  return Math.abs(height / 2 / Math.sin(angle))
}

function angleIsInRange(angle: number, minAngle: number, maxAngle: number) {
  return minAngle <= angle && angle <= maxAngle
}

export function radiansFromDegrees(deg: number) {
  return deg * (Math.PI / 180)
}

export function degreesFromRadians(radians: number) {
  return radians / (Math.PI / 180)
}
