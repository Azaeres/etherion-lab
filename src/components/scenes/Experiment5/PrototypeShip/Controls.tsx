import { useTick } from '@pixi/react'
import { Body, Vec2 } from 'planck'
import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { Vec2Meters } from 'src/utils/physics'
import { useOverlayClickListener } from '../../Experiment2/Overlay/events'
import {
  useAttackActivateListener,
  useAttackDisengageListener,
  useAttackEngageListener,
  useMoveActivateListener,
  useMoveDisengageListener,
  useMoveEngageListener,
} from '../../Experiment2/Button/events'
import { useDPadVectorUpdateListener } from '../../Experiment2/Dpad/events'
import { useHotkeys } from 'react-hotkeys-hook'
import { radiansFromDegrees } from '../../Experiment2/Button'
import BulletSpawnManager from './Bullet/BulletSpawnManager'
import { getVectorFromHeading } from '.'
import { AreaId } from '../AreaSwitch/areas'
import { emitAvatarCurrentAreaUpdate } from './events'
// import DebugDrawVector from '../DebugDrawVector'

export interface ControlsProps {
  actualHeading?: number
  bodyRef: MutableRefObject<Body | undefined>
  currentPosition: Vec2Meters
  currentVelocity: Vec2Meters
  area: AreaId
}

export default function Controls(props: ControlsProps) {
  const { actualHeading, bodyRef, currentPosition, currentVelocity, area } = props
  const [isFiring, setIsFiring] = useState(false)
  const [desiredHeading, setDesiredHeading] = useState<Vec2 | null>(null)

  const [currentArea, setCurrentArea] = useState<AreaId>(area)
  useEffect(() => {
    emitAvatarCurrentAreaUpdate(currentArea)
  }, [currentArea])

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
    [attackEventHandler, bodyRef, desiredHeading]
  )
  useOverlayClickListener(eventHandler)
  useMoveEngageListener(eventHandler)
  useMoveDisengageListener(eventHandler)
  useMoveActivateListener(eventHandler)
  useAttackEngageListener(attackEventHandler)
  useAttackDisengageListener(attackEventHandler)
  useAttackActivateListener(attackEventHandler)

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
  const brake = useCallback(
    (event: KeyboardEvent) => {
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
    },
    [bodyRef]
  )
  useHotkeys(' ', brake, { keyup: true, keydown: true })

  const moveToOtherArea = useCallback(() => {
    if (currentArea === 'AsteroidFieldArea') {
      setCurrentArea('NebulaArea')
    } else {
      setCurrentArea('AsteroidFieldArea')
    }
  }, [currentArea])
  useHotkeys('b', moveToOtherArea)

  const update = useCallback(() => {
    const body = bodyRef.current
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
  }, [actualHeading, bodyRef, desiredHeading])
  useTick(update)

  const body = bodyRef.current
  const velocity = body?.getLinearVelocity() as Vec2Meters

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

  return (
    <>
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
