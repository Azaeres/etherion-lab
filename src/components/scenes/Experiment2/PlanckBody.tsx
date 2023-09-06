import {
  ForwardedRef,
  PropsWithChildren,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { PlanckWorldContext } from './PlanckWorldProvider'
import { BodyDef, FixtureDef, Body } from 'planck'
import { Container, useTick } from '@pixi/react'
import { Meters, Pixels, Vec2Meters, pxFromMeters } from 'src/utils/physics'
import { Container as PixiContainer, DisplayObject } from 'pixi.js'
import DebugDraw from './DebugDraw'

export interface PlanckBodyProps extends BodyDef {
  bodyDef: BodyDef
  fixtureDefs?: readonly FixtureDef[]
  ref?: ForwardedRef<PixiContainer<DisplayObject>>
  debugDraw?: boolean
  bodyCallback?: (body: Body) => void
}

interface ContainerConfig {
  x: Meters
  y: Meters
  rotation: number
}

export default forwardRef<PixiContainer<DisplayObject>, PropsWithChildren<PlanckBodyProps>>(
  function PlanckBody(props, ref) {
    const { debugDraw = false, bodyDef, fixtureDefs } = props
    const world = useContext(PlanckWorldContext)
    const body = useMemo(() => {
      const body = world?.createBody(bodyDef)
      if (body && fixtureDefs) {
        fixtureDefs.forEach((fixtureDef) => {
          body.createFixture(fixtureDef)
        })
      }
      body && props.bodyCallback?.(body)
      return body
      // `props` is detected as a dependency, but that changes
      // every render. We don't want to create a new body every render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [world])
    useEffect(() => {
      return () => {
        body && world?.destroyBody(body)
      }
    }, [body, fixtureDefs, world])
    const [xPosition, setXPosition] = useState<Pixels>()
    const [yPosition, setYPosition] = useState<Pixels>()
    const [angle, setAngle] = useState<number>()
    const animatePhysics = useCallback(() => {
      if (body) {
        const bodyProperties = getCurrentBodyProperties(body)
        setXPosition(pxFromMeters(bodyProperties.x))
        setYPosition(pxFromMeters(bodyProperties.y))
        setAngle(bodyProperties.rotation)
      }
    }, [body])
    useTick(animatePhysics)

    // if (xPosition === 0 || yPosition === 0) {
    //   console.warn(
    //     'Warning: detected zero position > xPosition, yPosition:',
    //     xPosition,
    //     yPosition,
    //     bodyDef?.position
    //   )
    // }
    // if (xPosition === undefined || yPosition === undefined) {
    //   console.warn(
    //     'Warning: detected undefined position > xPosition, yPosition:',
    //     xPosition,
    //     yPosition,
    //     bodyDef?.position
    //   )
    // }

    if (
      body === undefined ||
      xPosition === undefined ||
      yPosition === undefined ||
      angle === undefined
    ) {
      return null
    } else {
      return (
        <Container x={xPosition} y={yPosition} rotation={angle} ref={ref}>
          {props.children}
          {debugDraw && <DebugDraw body={body} />}
        </Container>
      )
    }
  }
)

function getCurrentBodyProperties(body: Body): ContainerConfig {
  const position = body?.getPosition() as Vec2Meters
  const angle = body?.getAngle()
  return {
    x: position?.x,
    y: -position?.y as Meters,
    rotation: angle,
  }
}
