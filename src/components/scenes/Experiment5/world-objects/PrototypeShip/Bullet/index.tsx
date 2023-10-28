import { Graphics, useTick } from '@pixi/react'
import PlanckBody from '../../../../Experiment2/PlanckBody'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Graphics as PixiGraphics } from 'pixi.js'
import { Body, BodyDef, Box, Vec2 } from 'planck'
import { Meters, Vec2Meters, pxFromMeters } from 'src/utils/physics'
import { useCameraVelocityUpdateListener } from '../../../../Experiment2/events'

export interface BulletProps {
  id: string
  initialPosition: Vec2Meters
  initialVelocity: Vec2Meters
  destroy?: () => void
}

export default function Bullet(props: BulletProps) {
  const { id, initialPosition, initialVelocity, destroy } = props
  const bodyDef = useMemo<BodyDef>(() => {
    const linearVelocity = new Vec2(initialVelocity.x, -initialVelocity.y) as Vec2Meters
    return {
      type: 'dynamic',
      position: initialPosition.clone(),
      linearVelocity,
      bullet: true,
      fixedRotation: true,
      userData: {
        id,
        initialPosition,
        initialVelocity,
      },
    } as const
  }, [id, initialPosition, initialVelocity])
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
    setTimeout(() => {
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
      setBulletVelocity(velocity.clone() as Vec2Meters)
    }
  }, [physicsBody])
  useTick(update)
  // We simulate a motion blur effect by factoring in the camera's velocity.
  const [cameraVelocity, setCameraVelocity] = useState<Vec2Meters>()
  useCameraVelocityUpdateListener(setCameraVelocity)
  const drawBullet = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      if (bulletVelocity && cameraVelocity) {
        const velocityVector = bulletVelocity.clone() as Vec2Meters
        velocityVector.mul(1.5)

        // Draw an oversized bullet graphic for debug purposes.
        // const bulletSize = 40
        // g.beginFill('#fff', 1)
        // g.drawRoundedRect(0, 0, bulletSize, bulletSize, bulletSize)
        // g.endFill()

        g.beginFill('#fff', 1.0)
        g.lineStyle(18, '#fff', 1)
        g.moveTo(0, 0)
        g.lineTo(
          pxFromMeters((-velocityVector.x - cameraVelocity.x * 1.5) as Meters) * 0.01,
          pxFromMeters((-(-velocityVector.y) + cameraVelocity.y * 1.5) as Meters) * 0.01
        )
        g.endFill()
      }
    },
    [bulletVelocity, cameraVelocity]
  )
  return <Graphics draw={drawBullet} anchor={0.5} />
}
