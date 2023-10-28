import { ParallaxCameraContext, useParallaxCameraRef } from 'pixi-react-parallax'
import { Sprite, useTick } from '@pixi/react'
import PlanckBody from '../../../Experiment2/PlanckBody'
import { Box, Body, Vec2, BodyDef, Contact } from 'planck'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Meters, Vec2Meters } from 'src/utils/physics'
import { radiansFromDegrees } from '../../../Experiment2/Button'
import { emitPlayerAvatarSpeedUpdate } from './events'
import prototypeShipJson from './assets/prototype_ship.json'
import prototypeShipTexture from './assets/prototype_ship.webp'
import { useSpritesheetTextureMap } from 'src/app/hooks/useSpritesheetTextures'
import useCollisionCallback from 'src/app/hooks/useCollisionCallback'
import { useThrottledCallback } from 'use-debounce'
// import usePeerbitDatabase from '../hooks/usePeerbitDatabase'
// import { WorldObjectConfig } from '../AreaDB'
import Controls from './Controls'
import { usePeer } from '@peerbit/react'
import { WorldObjectConfig } from '../../database/WorldObject'
import { getIdFromPeer } from '../../database'
// import DebugDrawVector from '../DebugDrawVector'

const fixtures = [
  {
    shape: Box(1.0, 1.0),
    density: 1.0,
    friction: 0.3,
  },
] as const

export default function PrototypeShip(props: WorldObjectConfig) {
  const [, setCameraTargetRef] = useParallaxCameraRef()
  const { pos_x, pos_y, rotation, scale, owner, area } = props
  const { peer } = usePeer()
  const peerId = getIdFromPeer(peer)

  const isUpstream = owner === peerId
  // If we're upstream of the database, this is our avatar. Wire up the controls.
  // Our component state is the source of truth, and we treat props as initial state.

  // If we're downstream of the database, this is NOT our avatar. Do NOT wire up the controls.
  // The database is our source of truth, and we treat props as state correction.
  const bodyDef: BodyDef = useMemo(() => {
    return {
      type: 'dynamic',
      position: Vec2(pos_x, pos_y),
      angle: rotation,
    }
  }, [rotation, pos_x, pos_y])
  const camera = useContext(ParallaxCameraContext)
  // const click = useCallback(() => {
  //   camera?.shake(40, 0.2)
  // }, [camera])
  // const [count, setCount] = useState(0)
  const bodyRef = useRef<Body>()
  const callback = useCallback(
    (body: Body) => {
      bodyRef.current = body
    },
    [bodyRef]
  )

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
    }

    const _actualHeading = body?.getAngle()
    setActualHeading(_actualHeading)

    const _position = body?.getPosition() as Vec2Meters
    setCurrentPosition(_position.clone() as Vec2Meters)
  }, [])
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
            scale={scale}
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
      {isUpstream && (
        <Controls
          actualHeading={actualHeading}
          bodyRef={bodyRef}
          currentPosition={currentPosition}
          currentVelocity={currentVelocity}
          area={area}
        />
      )}
    </>
  )
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
