import {
  ForwardedRef,
  PropsWithChildren,
  forwardRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { PlanckWorldContext } from './PlanckWorldProvider'
import planck from 'planck'
import { Container, useTick } from '@pixi/react'
import { pxFromMeters } from 'src/utils/physics'
import * as PIXI from 'pixi.js'
import DebugDraw from './DebugDraw'

export interface PlanckBodyProps extends planck.BodyDef {
  bodyDef: planck.BodyDef
  fixtureDefs?: readonly planck.FixtureDef[]
  ref?: ForwardedRef<PIXI.Container<PIXI.DisplayObject>>
  debugDraw?: boolean
  getBody?: (body: planck.Body) => void
}

interface ContainerConfig {
  x: number
  y: number
  rotation: number
}

export default forwardRef<PIXI.Container<PIXI.DisplayObject>, PropsWithChildren<PlanckBodyProps>>(
  function PlanckBody(props, ref) {
    const { debugDraw = false, bodyDef, fixtureDefs } = props
    const world = useContext(PlanckWorldContext)
    const body = useMemo(() => {
      const body = world?.createBody(bodyDef)
      body && props.getBody?.(body)
      return body
      // `props` is detected as a dependency, but that changes
      // every render. We don't want to create a new body every render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [world])
    useLayoutEffect(() => {
      if (body && fixtureDefs) {
        fixtureDefs.forEach((fixtureDef) => {
          return body.createFixture(fixtureDef)
        })
      }
      return () => {
        body && world?.destroyBody(body)
      }
    }, [body, fixtureDefs, world])
    const [xPosition, setXPosition] = useState<number>(0)
    const [yPosition, setYPosition] = useState<number>(0)
    const [angle, setAngle] = useState<number>(0)
    const animatePhysics = useCallback(() => {
      if (body) {
        const config = getContainerConfigFromBody(body)
        setXPosition(pxFromMeters(config.x))
        setYPosition(pxFromMeters(config.y))
        setAngle(config.rotation)
      }
    }, [body])
    useTick(animatePhysics)

    return (
      <Container x={xPosition} y={yPosition} rotation={angle} ref={ref}>
        {props.children}
        {debugDraw && <DebugDraw body={body} />}
      </Container>
    )
  }
)

function getContainerConfigFromBody(body: planck.Body): ContainerConfig {
  const position = body?.getPosition()
  const angle = body?.getAngle()
  return {
    x: position?.x,
    y: -position?.y,
    rotation: angle,
  }
}
