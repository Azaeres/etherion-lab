import { Vec2Meters } from 'src/utils/physics'
import Bullet from '.'
import { Vec2 } from 'planck'
import { useCallback, useEffect, useRef } from 'react'
import getUUID from 'src/app/utils/getUUID'
import memoize from 'nano-memoize'
import { useInterval } from 'react-interval-hook'

type BulletConfig = {
  id: string
  initialPosition: Vec2Meters
  initialVelocity: Vec2Meters
}

export interface BulletSpawnManagerProps {
  sourcePosition: Vec2Meters
  currentHeading: Vec2Meters
  currentVelocity: Vec2Meters
  isFiring: boolean
}
export default function BulletSpawnManager(props: BulletSpawnManagerProps) {
  const { sourcePosition, currentHeading, currentVelocity, isFiring } = props
  const bulletsRef = useRef<BulletConfig[]>([])
  // const [bullets, setBullets] = useState<BulletConfig[]>([])
  const spawnBullet = useCallback(() => {
    // console.log('Spawn bullet  :')
    // const newCollection = [...bulletsRef.current]
    const id = getUUID()
    const bulletConfig = {
      id,
      initialPosition: sourcePosition,
      initialVelocity: getInitialVelocity(currentHeading).add(currentVelocity) as Vec2Meters,
    }
    bulletsRef.current.push(bulletConfig)
    // bulletsRef.current = newCollection
  }, [currentHeading, currentVelocity, sourcePosition])
  const { start, stop } = useInterval(() => {
    // console.log('interval fired  :', isFiring)
    if (isFiring) {
      spawnBullet()
    } else {
      stop()
    }
  }, 100)
  useEffect(() => {
    if (isFiring) {
      start()
    }
  }, [isFiring, start])
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
      {bulletsRef.current.map((bulletConfig) => {
        // console.log('render mapping  > bulletsRef.current:', bulletsRef.current)
        return (
          <Bullet
            key={bulletConfig.id}
            initialPosition={bulletConfig.initialPosition}
            initialVelocity={bulletConfig.initialVelocity}
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

const VELOCITY_SCALAR = 100.0
function getInitialVelocity(currentHeading: Vec2Meters) {
  return new Vec2(
    currentHeading.x * VELOCITY_SCALAR,
    -currentHeading.y * VELOCITY_SCALAR
  ) as Vec2Meters
}
