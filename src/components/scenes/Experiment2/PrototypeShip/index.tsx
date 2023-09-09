import { ParallaxCameraContext, useParallaxCameraRef } from 'pixi-react-parallax'
import { Sprite, useTick } from '@pixi/react'
import PlanckBody from '../PlanckBody'
import { Box, Body, Vec2, BodyDef, Contact } from 'planck'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Meters, Vec2Meters } from 'src/utils/physics'
import { useOverlayClickListener } from '../Overlay/events'
import {
  useAttackActivateListener,
  useAttackDisengageListener,
  useAttackEngageListener,
  useMoveActivateListener,
  useMoveDisengageListener,
  useMoveEngageListener,
} from '../Button/events'
import { useDPadVectorUpdateListener } from '../Dpad/events'
import { useHotkeys } from 'react-hotkeys-hook'
import { radiansFromDegrees } from '../Button'
import { emitPlayerAvatarSpeedUpdate } from './events'
import prototypeShipJson from './assets/prototype_ship.json'
import prototypeShipTexture from './assets/prototype_ship.webp'
import { useSpritesheetTextureMap } from 'src/app/hooks/useSpritesheetTextures'
import BulletSpawnManager from './Bullet/BulletSpawnManager'
import useCollisionCallback from 'src/app/hooks/useCollisionCallback'
import { useThrottledCallback } from 'use-debounce'
// import DebugDrawVector from '../DebugDrawVector'

export interface PrototypeShipProps {
  x?: Meters
  y?: Meters
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

export default function PrototypeShip(props: PrototypeShipProps) {
  const [, setCameraTargetRef] = useParallaxCameraRef()
  const { x = 0, y = 0, rotation = radiansFromDegrees(-90) } = props
  const bodyDef: BodyDef = useMemo(() => {
    return {
      type: 'dynamic',
      position: Vec2(x, y),
      angle: rotation,
    }
  }, [rotation, x, y])
  const camera = useContext(ParallaxCameraContext)
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
  const [isFiring, setIsFiring] = useState(false)

  const isKeyDownRef = useRef(false)
  const attackEventHandler = useCallback((event: KeyboardEvent | MouseEvent) => {
    if (event.type === 'pointerdown') {
      // console.log('PEW!!! :', event.type, event)
      setIsFiring(true)
    } else if (event.type === 'pointerup') {
      setIsFiring(false)
    }
  }, [])
  const eventHandler = useCallback(
    (event: KeyboardEvent | MouseEvent /*, handler: HotkeysEvent */) => {
      // console.log('avatar rcvd > event.type:', event.type)
      // console.log(' > event:', event)
      if ('repeat' in event && event?.repeat) {
        return
      }
      if ('button' in event && event?.button === 2) {
        // Secondary mouse button.
        attackEventHandler(event)
        return
      }
      // console.log('eventHandler  > event.type:', event.type, event)
      const body = bodyRef.current
      if (event.type === 'keydown' || event.type === 'pointerdown') {
        isKeyDownRef.current = true
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
          const vector = new Vec2(desiredHeading.x, -desiredHeading.y) as Vec2Meters
          vector.mul(0.1)
          body?.applyLinearImpulse(vector, body.getPosition())
        }
      }
      if (event.type === 'keyup' || event.type === 'pointerup' || event.type === 'pointerout') {
        isKeyDownRef.current = false
      }
    },
    [attackEventHandler, desiredHeading]
  )
  useOverlayClickListener(eventHandler)
  useMoveEngageListener(eventHandler)
  useMoveDisengageListener(eventHandler)
  useMoveActivateListener(eventHandler)
  useAttackEngageListener(attackEventHandler)
  useAttackDisengageListener(attackEventHandler)
  useAttackActivateListener(attackEventHandler)

  const [currentPosition, setCurrentPosition] = useState(bodyDef.position as Vec2Meters)
  const [currentVelocity, setCurrentVelocity] = useState<Vec2Meters>(Vec2.zero() as Vec2Meters)
  // const [currentSpeed, setCurrentSpeed] = useState<Meters>(0.0 as Meters)
  const [actualHeading, setActualHeading] = useState<number | undefined>(
    bodyRef.current?.getAngle()
  )
  useEffect(() => {
    const currentSpeed = getSpeedFromVelocity(currentVelocity)
    emitPlayerAvatarSpeedUpdate(currentSpeed)
  }, [currentVelocity])

  const rotateBody = useCallback((vector: Vec2 | null) => {
    if (vector === null) {
      setDesiredHeading(null)
    } else {
      const _heading = new Vec2(vector.x, vector.y)
      // Cap desired heading to an equidistant circle around the ship.
      if (_heading.length() >= 250) {
        _heading.normalize()
        _heading.mul(250)
      }
      setDesiredHeading(_heading)
    }
  }, [])
  useDPadVectorUpdateListener(rotateBody)

  const isBrakingRef = useRef(false)
  const brake = useCallback((event: KeyboardEvent) => {
    if ('repeat' in event && event?.repeat) {
      return
    }

    // Pump brake
    // console.log('Pumping brake  :')
    const body = bodyRef.current
    const velocity = body?.getLinearVelocity() as Vec2Meters
    body?.applyLinearImpulse(
      new Vec2(velocity.x - velocity.x * 2, velocity.y - velocity.y * 2),
      body.getPosition()
    )

    if (event.type === 'keyup') {
      isBrakingRef.current = false
    } else {
      isBrakingRef.current = true
    }
  }, [])
  useHotkeys(' ', brake, { keyup: true, keydown: true })

  const update = useCallback(() => {
    const body = bodyRef.current
    const velocity = body?.getLinearVelocity() as Vec2Meters
    if (velocity) {
      // Cap the ship speed.
      // https://stackoverflow.com/questions/12504534/how-to-enforce-a-maximum-speed-for-a-specific-body-in-libgdx-box2d/12511152
      // const speed = Math.sqrt(getSpeedFromVelocity(velocity))
      // if (speed >= Math.sqrt(5000)) {
      //   const velocityClone = velocity.clone()
      //   velocityClone.normalize()
      //   velocityClone.mul(Math.sqrt(5000))
      //   bodyRef.current?.setLinearVelocity(velocityClone)
      // }
      const speed = getSpeedFromVelocity(velocity)
      if (speed >= 90) {
        const environmentFriction = velocity.clone()
        environmentFriction.neg()
        environmentFriction.mul(1.6)
        body?.applyForce(environmentFriction, body.getPosition())
      }

      // Sync physics-engine-sourced velocity with component state.
      setCurrentVelocity(new Vec2(velocity.x, -velocity.y) as Vec2Meters)

      // Handle the mobile interface button for accelerating (directional motion)
      // and for braking (non-directional motion).
      if (isKeyDownRef.current) {
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
          const forceVector = new Vec2(desiredHeading.x, -desiredHeading.y).mul(1 / 2)
          body?.applyForce(forceVector, body.getPosition())
        }
      }

      // Handle the desktop interface button (spacebar) for braking.
      if (isBrakingRef.current) {
        body?.applyForce(
          new Vec2(velocity.x - velocity.x * 6, velocity.y - velocity.y * 6),
          body.getPosition()
        )
      }
    }

    const _actualHeading = body?.getAngle()
    setActualHeading(_actualHeading)

    const _position = body?.getPosition() as Vec2Meters
    setCurrentPosition(_position.clone() as Vec2Meters)

    // https://www.iforce2d.net/b2dtut/rotate-to-angle
    const actualHeadingVector = actualHeading ? getVectorFromHeading(actualHeading) : null
    const desiredHeadingVector =
      (desiredHeading && new Vec2(desiredHeading.x, -desiredHeading.y)) || undefined
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
      const actualHeadingAngle = Math.atan2(-actualHeadingVector.y, actualHeadingVector.x)
      const desiredHeadingAngle = Math.atan2(-desiredHeadingVector.y, desiredHeadingVector.x)
      const nextAngle = actualHeadingAngle + angularVelocity / 6
      let totalRotation = -desiredHeadingAngle - nextAngle
      while (totalRotation < -radiansFromDegrees(180)) totalRotation += radiansFromDegrees(360)
      while (totalRotation > radiansFromDegrees(180)) totalRotation -= radiansFromDegrees(360)
      const desiredAngularVelocity = totalRotation * 2
      const impulse = inertia * desiredAngularVelocity
      body?.applyAngularImpulse(impulse)
    }
  }, [actualHeading, desiredHeading])
  useTick(update)

  const textures = useSpritesheetTextureMap(prototypeShipTexture.src, prototypeShipJson)
  const texture = textures && textures['40 X 32 sprites_result-18.png']
  // console.log('ship  > currentVelocity.x:', currentVelocity.x)
  // const speed = getSpeedFromVelocity(currentVelocity)
  // const normalizedVelocity = currentVelocity.clone() as Vec2Meters
  // normalizedVelocity.normalize()
  // normalizedVelocity.mul(speed * 0.02)

  const shake = useThrottledCallback((strength: number) => {
    let _strength = strength * 0.5
    _strength = _strength >= 60 ? 60 : _strength
    camera?.shake(_strength, 0.4)
  }, 500)
  const collisionCallback = useCallback(
    (contact: Contact, strength: number) => {
      shake(strength)
    },
    [shake]
  )
  useCollisionCallback(collisionCallback, bodyRef.current)
  return (
    <>
      <PlanckBody
        bodyDef={bodyDef}
        fixtureDefs={fixtures}
        ref={setCameraTargetRef}
        debugDraw={false}
        bodyCallback={callback}
      >
        {texture && (
          <Sprite
            anchor={0.5}
            texture={texture}
            // {...props}
            // onpointerup={click}
            cursor="pointer"
            eventMode="dynamic"
            scale={6}
            rotation={radiansFromDegrees(-90)}
          />
        )}
      </PlanckBody>
      {/* {actualHeading && (
        <DebugDrawVector
          origin={getGunPosition(currentPosition, actualHeading)}
          trackingVector={currentVelocity as Vec2Meters}
          color="green"
          // scale={0.1}
        />
      )} */}
      {actualHeading && (
        <BulletSpawnManager
          gunPosition={getGunPosition(currentPosition, actualHeading)}
          gunVector={getVectorFromHeading(actualHeading)}
          currentVelocity={currentVelocity}
          isFiring={isFiring}
        />
      )}
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

function getGunPosition(currentPosition: Vec2Meters, actualHeading: number) {
  const headingVector = getVectorFromHeading(actualHeading)
  const position = new Vec2(
    currentPosition.x + headingVector.x * 1.6,
    currentPosition.y - headingVector.y * 1.6
  )
  return position as Vec2Meters
}

export function getSpeedFromVelocity(velocity: Vec2Meters) {
  return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) as Meters
}

export function getVectorFromHeading(heading: number) {
  return new Vec2(Math.cos(heading), -Math.sin(heading)) as Vec2Meters
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
