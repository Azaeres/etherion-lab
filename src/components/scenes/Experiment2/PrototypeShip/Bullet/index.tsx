import { Graphics, useTick } from '@pixi/react'
import PlanckBody from '../../PlanckBody'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Graphics as PixiGraphics } from 'pixi.js'
import { Vec2, Body, BodyDef, Box } from 'planck'
import { Vec2Meters } from 'src/utils/physics'

export interface BulletProps {
  initialPosition: Vec2Meters
  initialVelocity: Vec2Meters
  destroy?: () => void
}

export default function Bullet(props: BulletProps) {
  const { initialPosition, initialVelocity, destroy } = props
  const bodyDef = useMemo<BodyDef>(() => {
    const position = new Vec2(initialPosition.x, initialPosition.y)
    return {
      type: 'dynamic',
      position,
      linearVelocity: initialVelocity,
      bullet: true,
    } as const
  }, [])
  const fixtures = useMemo(() => {
    return [
      {
        shape: Box(0.1, 0.1),
        density: 0.5,
        friction: 0.3,
      },
    ]
  }, [])
  const bodyRef = useRef<Body>()
  const bodyCallback = useCallback(
    (body: Body) => {
      bodyRef.current = body
    },
    [bodyRef]
  )
  useEffect(() => {
    // console.log('Bullet useEffect CREATING TIMER  :')
    setTimeout(() => {
      // console.log('useEffect setTimeout TIMER FIRED! :')
      // debugger
      destroy && destroy()
    }, 2000)
  }, [])
  return (
    <PlanckBody
      bodyDef={bodyDef}
      fixtureDefs={fixtures}
      debugDraw={false}
      bodyCallback={bodyCallback}
    >
      <BulletGraphic physicsBody={bodyRef.current} />
    </PlanckBody>
  )
}

interface BulletGraphicProps {
  physicsBody?: Body
}

function BulletGraphic(props: BulletGraphicProps) {
  const { physicsBody } = props
  const [bulletVelocity, setBulletVelocity] = useState<Vec2Meters>()
  const update = useCallback(() => {
    if (physicsBody) {
      const velocity = physicsBody.getLinearVelocity() as Vec2Meters
      setBulletVelocity(new Vec2(velocity.x, velocity.y) as Vec2Meters)
    }
  }, [physicsBody])
  useTick(update)
  const drawBullet = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      if (bulletVelocity) {
        const velocityVector = bulletVelocity.clone()
        g.beginFill('#fff', 1.0)
        g.lineStyle(18, '#fff', 1)
        g.moveTo(0, 0)
        g.lineTo(velocityVector.x, -velocityVector.y)
        g.endFill()
      }
    },
    [bulletVelocity]
  )
  return <Graphics draw={drawBullet} anchor={0.5} />
}
