import { Vec2Meters } from 'src/utils/physics'
import Bullet from '.'
import { useCallback, useEffect, useRef, useState } from 'react'
import getUUID from 'src/app/utils/getUUID'
import memoize from 'nano-memoize'
import { useInterval } from 'react-interval-hook'
// import DebugDrawVector from '../../DebugDrawVector'

type BulletConfig = {
  id: string
}

const RAPID_FIRE_INTERVAL = 100
const BULLET_VELOCITY_SCALAR = 100.0

export interface BulletSpawnManagerProps {
  gunPosition: Vec2Meters
  gunVector: Vec2Meters
  currentVelocity: Vec2Meters
  isFiring: boolean
}
export default function BulletSpawnManager(props: BulletSpawnManagerProps) {
  const { gunPosition, gunVector, currentVelocity, isFiring } = props
  const bulletsRef = useRef<BulletConfig[]>([])
  const spawnBullet = useCallback(() => {
    bulletsRef.current.push({ id: getUUID() })
  }, [])
  const lastTimeFiring = useRef<number>(new Date().getTime())
  const measureRate = useCallback(() => {
    const currentTime = new Date().getTime()
    const delta = currentTime - lastTimeFiring.current
    lastTimeFiring.current = currentTime
    return delta
  }, [])
  const [fastFiringDetected, setFastFiringDetected] = useState(false)
  const { start, stop } = useInterval(
    () => {
      if (isFiring || fastFiringDetected) {
        spawnBullet()
      } else {
        // Starting/stopping the interval timer only happens when we're not
        // spamming the fire button.
        !fastFiringDetected && stop()
      }
    },
    RAPID_FIRE_INTERVAL,
    {
      immediate: true,
      autoStart: false,
    }
  )
  useEffect(() => {
    if (isFiring) {
      const delta = measureRate()
      if (delta < RAPID_FIRE_INTERVAL) {
        setFastFiringDetected(true)
      } else {
        // Starting the interval timer resets the counter.
        // So if we're spamming the fire button (at a rate faster than the interval),
        // we don't want to interrupt the timer.
        start()
        setFastFiringDetected(false)
      }
    }
  }, [isFiring, measureRate, start])
  const destroyBullet = useCallback((id: string) => {
    // console.log('destroyBullet  > bulletsRef.current:', bulletsRef.current)
    const indexOfBulletToDestroy = bulletsRef.current.findIndex((bulletConfig) => {
      return bulletConfig.id === id
    })
    const newCollection = [...bulletsRef.current]
    newCollection.splice(indexOfBulletToDestroy, 1)
    bulletsRef.current = newCollection
    // console.log('bullet  collection after  > newCollection:', newCollection)
  }, [])
  return (
    <>
      {/* <DebugDrawVector origin={gunPosition} trackingVector={currentVelocity} color="red" /> */}
      {bulletsRef.current.map((bulletConfig) => {
        const _gunVector = gunVector.clone()
        _gunVector.mul(BULLET_VELOCITY_SCALAR)
        _gunVector.add(currentVelocity)
        return (
          <Bullet
            key={bulletConfig.id}
            id={bulletConfig.id}
            initialPosition={gunPosition.clone() as Vec2Meters}
            initialVelocity={_gunVector as Vec2Meters}
            destroy={memoize(() => {
              // console.log('destroy cb  :', bulletConfig.id, bulletsRef.current)
              destroyBullet(bulletConfig.id)
            })}
          />
        )
      })}
    </>
  )
}
