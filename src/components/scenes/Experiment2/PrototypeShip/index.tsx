import { Texture } from 'pixi.js'
import logo from 'src/components/Logo/etherion-logo.png'
import { useParallaxCameraRef } from 'pixi-react-parallax'
import { Sprite, useTick } from '@pixi/react'
import PlanckBody from '../PlanckBody'
import { Box, Body, Vec2 } from 'planck'
import { useCallback, useRef, useState } from 'react'
import { metersFromPx, pxFromMeters } from 'src/utils/physics'
import { useMessageListener } from '../events'
import {
  useMoveActivateListener,
  useMoveDisengageListener,
  useMoveEngageListener,
} from '../Button/events'
import { useDPadVectorUpdateListener } from '../Dpad/events'
import { useHotkeys } from 'react-hotkeys-hook'
import { radiansFromDegrees } from '../Button'
import { emitPlayerAvatarSpeedUpdate } from './events'

export interface AnimatedLogoProps {
  x?: number
  y?: number
  rotation?: number
  scale?: number
}

const fixtures = [
  {
    shape: Box(1.0, 1.0),
    density: 1.0,
    friction: 0.3,
  },
] as const

export default function PrototypeShip(props: AnimatedLogoProps) {
  const [, setCameraTargetRef] = useParallaxCameraRef()
  const { x = 0, y = 0, rotation = radiansFromDegrees(-90) } = props
  // const camera = useContext(ParallaxCameraContext)
  // const click = useCallback(() => {
  //   camera?.shake(40, 0.2)
  // }, [camera])
  // const [count, setCount] = useState(0)
  const [desiredHeading, setDesiredHeading] = useState<Vec2 | null>(null)
  const bodyRef = useRef<Body>()
  const callback = useCallback(
    (body: Body) => {
      bodyRef.current = body
    },
    [bodyRef]
  )

  const isKeyDown = useRef<boolean>(false)
  const eventHandler = useCallback(
    (event: KeyboardEvent | MouseEvent /*, handler: HotkeysEvent */) => {
      // console.log('avatar rcvd > event.type:', event.type)
      if ('repeat' in event && event?.repeat) {
        return
      }
      // console.log('eventHandler  > event.type:', event.type, event)
      const body = bodyRef.current
      if (event.type === 'keydown' || event.type === 'pointerdown') {
        isKeyDown.current = true
        // Vec2(0.0, 200.0)
        // console.log('applying linear impulse  > desiredHeading:', desiredHeading)
        if (desiredHeading === null) {
          const velocity = bodyRef.current?.getLinearVelocity()
          if (velocity) {
            // Pump brake
            // console.log('Pumping brake  :')
            body?.applyLinearImpulse(
              new Vec2(velocity.x - velocity.x * 2, velocity.y - velocity.y * 2),
              body.getPosition()
            )
          }
        } else {
          // Boost
          // console.log('Boost! :')
          body?.applyLinearImpulse(
            new Vec2(desiredHeading.x / 12, desiredHeading.y / 12),
            body.getPosition()
          )
        }
      }
      // setCount((count) => {
      //   if (event.type === 'keydown' || event.type === 'pointerdown') {
      //     return count + 1
      //   } else {
      //     return count
      //   }
      // })
      if (event.type === 'keyup' || event.type === 'pointerup' || event.type === 'pointerout') {
        isKeyDown.current = false
      }
    },
    [desiredHeading]
  )
  useMessageListener(eventHandler)
  useMoveEngageListener(eventHandler)
  useMoveDisengageListener(eventHandler)
  useMoveActivateListener(eventHandler)

  const [actualHeading, setActualHeading] = useState<number | undefined>(
    bodyRef.current?.getAngle()
  )
  const [currentSpeed, setCurrentSpeed] = useState<number>(0.0)
  emitPlayerAvatarSpeedUpdate(currentSpeed)

  const rotateBody = useCallback((vector: Vec2 | null) => {
    if (vector === null) {
      setDesiredHeading(null)
    } else {
      const _heading = new Vec2(vector.x, -vector.y)
      setDesiredHeading(_heading)
    }
  }, [])
  useDPadVectorUpdateListener(rotateBody)

  const brake = useCallback((event: KeyboardEvent | MouseEvent) => {
    const body = bodyRef.current
    const velocity = body?.getLinearVelocity()
    if (velocity) {
      if ('repeat' in event && event?.repeat) {
        body?.applyForce(
          new Vec2(velocity.x - velocity.x * 6, velocity.y - velocity.y * 6),
          body.getPosition()
        )
      } else {
        body?.applyLinearImpulse(
          new Vec2(velocity.x - velocity.x * 2, velocity.y - velocity.y * 2),
          body.getPosition()
        )
      }
    }
  }, [])
  useHotkeys(' ', brake, { keyup: true, keydown: true })

  const update = useCallback(() => {
    const velocity = bodyRef.current?.getLinearVelocity()
    if (velocity !== undefined) {
      const speed = velocity.x * velocity.x + velocity.y * velocity.y
      setCurrentSpeed(speed)
      if (isKeyDown.current) {
        const body = bodyRef.current
        if (desiredHeading === null) {
          // Steady brake
          // console.log('Applying steady brake  :')
          body?.applyForce(
            new Vec2(velocity.x - velocity.x * 10, velocity.y - velocity.y * 10),
            body.getPosition()
          )
        } else {
          // Accelerate
          // console.log('Accelerating  :')
          body?.applyForce(new Vec2(desiredHeading.x / 4, desiredHeading.y / 4), body.getPosition())
        }
      }
    }

    const _actualHeading = bodyRef.current?.getAngle()
    setActualHeading(_actualHeading)

    // https://www.iforce2d.net/b2dtut/rotate-to-angle
    const actualHeadingVector = getVectorFromHeading(actualHeading)
    const desiredHeadingVector =
      (desiredHeading && new Vec2(desiredHeading.x, -desiredHeading.y)) || undefined
    const body = bodyRef.current
    const angularVelocity = body?.getAngularVelocity()
    const inertia = body?.getInertia()
    // console.log(
    //   ' > actualHeadingVector, desiredHeadingVector, angularVelocity, inertia:',
    //   actualHeadingVector,
    //   desiredHeadingVector,
    //   angularVelocity,
    //   inertia
    // )
    if (
      actualHeadingVector &&
      desiredHeadingVector &&
      angularVelocity !== undefined &&
      inertia !== undefined
    ) {
      const actualHeadingAngle = Math.atan2(actualHeadingVector.y, actualHeadingVector.x)
      const desiredHeadingAngle = Math.atan2(desiredHeadingVector.y, desiredHeadingVector.x)
      const nextAngle = actualHeadingAngle + angularVelocity / 6
      let totalRotation = desiredHeadingAngle - nextAngle
      while (totalRotation < -radiansFromDegrees(180)) totalRotation += radiansFromDegrees(360)
      while (totalRotation > radiansFromDegrees(180)) totalRotation -= radiansFromDegrees(360)
      const desiredAngularVelocity = totalRotation * 2
      const impulse = inertia * desiredAngularVelocity
      body?.applyAngularImpulse(impulse)
    }
  }, [actualHeading, desiredHeading])
  useTick(update)

  return (
    <>
      <PlanckBody
        bodyDef={{
          type: 'dynamic',
          position: Vec2(metersFromPx(x), metersFromPx(y)),
          angle: rotation,
        }}
        fixtureDefs={fixtures}
        ref={setCameraTargetRef}
        // debugDraw={true}
        bodyCallback={callback}
      >
        <Sprite
          anchor={0.5}
          texture={Texture.from(logo.src)}
          // {...props}
          // onpointerup={click}
          cursor="pointer"
          eventMode="dynamic"
        />
        {/* <>
          {count !== undefined && (
            <Text
              text={count.toString()}
              style={new TextStyle({ fill: '0xcccccc', fontSize: '38px' })}
              // {...props}
              x={120}
              y={-100}
              scale={10}
            />
          )}
          {currentSpeed !== undefined && (
            <Text
              text={currentSpeed?.toFixed(2)}
              style={new TextStyle({ fill: '0xcccccc', fontSize: '38px' })}
              // {...props}
              x={120}
              y={-20}
              scale={10}
            />
          )}
        </> */}
      </PlanckBody>
      {/* <DesktopView>
        <DebugHeadingVector
          origin={
            currentX && currentY
              ? new Vec2(pxFromMeters(currentX), -pxFromMeters(currentY))
              : undefined
          }
          trackingVector={getVectorFromHeading(actualHeading)?.mul(10)}
        />
        <DebugHeadingVector
          origin={
            currentX && currentY
              ? new Vec2(pxFromMeters(currentX), -pxFromMeters(currentY))
              : undefined
          }
          trackingVector={
            (desiredHeading && new Vec2(desiredHeading.x, -desiredHeading.y)) || undefined
          }
        />
      </DesktopView> */}
    </>
  )
}

function getVectorFromHeading(heading?: number) {
  if (heading) {
    return new Vec2(pxFromMeters(Math.cos(heading)), pxFromMeters(Math.sin(heading)))
  } else {
    return null
  }
}

// function getAngleFromHeading(x: number, y: number) {
//   const ninety = Math.PI / 2
//   let result
//   if (x == 0) {
//     // special cases
//     result = y > 0 ? ninety : y == 0 ? 0 : 3 * ninety
//   } else if (y == 0) {
//     // special cases
//     result = x >= 0 ? 0 : 2 * ninety
//   } else {
//     result = Math.atan(y / x)
//     if (x < 0 && y < 0)
//       // quadrant Ⅲ
//       result = 2 * ninety + result
//     else if (x < 0)
//       // quadrant Ⅱ
//       result = 2 * ninety + result // it actually substracts
//     else if (y < 0)
//       // quadrant Ⅳ
//       result = 3 * ninety + (ninety + result) // it actually substracts
//   }

//   return result
// }
