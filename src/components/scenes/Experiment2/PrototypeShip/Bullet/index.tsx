import { Graphics, useTick } from '@pixi/react'
import PlanckBody from '../../PlanckBody'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Graphics as PixiGraphics } from 'pixi.js'
import { Body, BodyDef, Box } from 'planck'
import { Meters, Vec2Meters, pxFromMeters } from 'src/utils/physics'
import { useCameraVelocityUpdateListener } from '../../events'

export interface BulletProps {
  id: string
  initialPosition: Vec2Meters
  initialVelocity: Vec2Meters
  destroy?: () => void
}

export default function Bullet(props: BulletProps) {
  const { id, initialPosition, initialVelocity, destroy } = props
  const bodyDef = useMemo<BodyDef>(() => {
    return {
      type: 'dynamic',
      position: initialPosition.clone(),
      linearVelocity: initialVelocity.clone(),
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
  // const [bulletPosition, setBulletPosition] = useState<Vec2Meters>()
  const [bulletVelocity, setBulletVelocity] = useState<Vec2Meters>()
  const update = useCallback(() => {
    if (physicsBody) {
      // const position = physicsBody.getPosition() as Vec2Meters
      // setBulletPosition(position.clone() as Vec2Meters)
      const velocity = physicsBody.getLinearVelocity() as Vec2Meters
      setBulletVelocity(velocity.clone() as Vec2Meters)
    }
  }, [physicsBody])
  useTick(update)
  // const userData = physicsBody?.getUserData()
  // console.log('Bullet > :', userData, bulletPosition, bulletVelocity)
  // We simulate a motion blur effect by factoring in the camera's velocity.
  const [cameraVelocity, setCameraVelocity] = useState<Vec2Meters>()
  useCameraVelocityUpdateListener(setCameraVelocity)
  const drawBullet = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      if (bulletVelocity && cameraVelocity) {
        const velocityVector = bulletVelocity.clone() as Vec2Meters
        velocityVector.mul(1.5)

        // const bulletSize = 40
        // g.beginFill('#fff', 1)
        // g.drawRoundedRect(0, 0, bulletSize, bulletSize, bulletSize)
        // g.endFill()

        // console.log('  > velocityVector.x:', velocityVector.x, cameraVelocity.x)
        // console.log(' > cameraVelocity.x, cameraVelocity.y:', cameraVelocity.x, cameraVelocity.y)
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
