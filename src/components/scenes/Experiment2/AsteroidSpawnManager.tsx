import { useCallback, useContext, useEffect, useState } from 'react'
import { Vec2 } from 'planck'
import { ParallaxCameraContext } from 'pixi-react-parallax'
import DestructableAsteroid from './DestructableAsteroid'
import { useTick } from '@pixi/react'
import { metersFromPx } from 'src/utils/physics'

export interface AsteroidSpawnManagerProps {
  // The count of asteroids to populate.
  density?: number
}

type AsteroidConfig = {
  id: string
  x?: number
  y?: number
}

const GENERATION_DISTANCE = 50
const DEFAULT_DENSITY = 30

export default function AsteroidSpawnManager(props: AsteroidSpawnManagerProps) {
  const { density = DEFAULT_DENSITY } = props
  const camera = useContext(ParallaxCameraContext)
  const [cameraPosition, setCameraPosition] = useState<Vec2 | undefined>()
  useTick(() => {
    if (camera) {
      const cameraPosition = new Vec2(metersFromPx(-camera.x), metersFromPx(camera.y))
      setCameraPosition(cameraPosition)
    }
  })
  const [asteroids, setAsteroids] = useState<AsteroidConfig[]>([])
  useEffect(() => {
    const availableSlots = density - asteroids.length
    if (availableSlots > 0) {
      const newCollection = [...asteroids]
      for (let index = 0; index < availableSlots; index++) {
        // console.log(' > cameraPosition?.x:', cameraPosition?.x)
        if (cameraPosition) {
          // const cameraPosition = new Vec2(metersFromPx(-camera.x), metersFromPx(camera.y))
          const randomPoint = getRandomPointOnGenerationBoundary(cameraPosition)
          const asteroidConfig = getAsteroidConfig(randomPoint.x, randomPoint.y)
          // console.log('spawning w cameraPosition  > asteroidConfig:', asteroidConfig)
          newCollection.push(asteroidConfig)
        } else {
          const asteroidConfig = getAsteroidConfig()
          // console.log('spawning  > asteroidConfig:', asteroidConfig)
          newCollection.push(asteroidConfig)
        }
      }
      setAsteroids(newCollection)
    }
  }, [asteroids, density, cameraPosition?.x, cameraPosition?.y, cameraPosition])
  // console.log(' > asteroids:', asteroids)
  const destroyAsteroid = useCallback(
    (id: string) => {
      // debugger
      const indexOfAsteroidToDestroy = asteroids.findIndex((asteroidConfig) => {
        return asteroidConfig.id === id
      })
      const newCollection = [...asteroids]
      newCollection.splice(indexOfAsteroidToDestroy, 1)
      setAsteroids(newCollection)
    },
    [asteroids]
  )
  return (
    <>
      {asteroids.map((asteroidConfig) => {
        return (
          <DestructableAsteroid
            key={asteroidConfig.id}
            cameraPosition={cameraPosition}
            destroyAsteroid={destroyAsteroid}
            {...asteroidConfig}
          />
        )
      })}
    </>
  )
}

function getRandomPointOnGenerationBoundary(cameraPosition: Vec2) {
  const randomPoint = _randomPointNearRect(
    cameraPosition.x - GENERATION_DISTANCE,
    cameraPosition.y - GENERATION_DISTANCE,
    GENERATION_DISTANCE * 2,
    GENERATION_DISTANCE * 2,
    10,
    10
  )
  // console.log(' > randomPoint:', randomPoint)
  return new Vec2(randomPoint.x, randomPoint.y)
}

// The arguments x,y top left inside edge of rectangle, w,h inside width
// and height of the rectangle minDist, maxDist the min and max dist the
// random point can be from the inside edge of the box. You can also use
// negative values have the points outside the rectangle. Note that the
// distances are always from the inside edge of the box. The values are
// also floored when return (can easily be remove and still works)
function _randomPointNearRect(
  x: number,
  y: number,
  w: number,
  h: number,
  minDist: number,
  maxDist: number
) {
  const dist = (Math.random() * (maxDist - minDist) + minDist) | 0
  x += dist
  y += dist
  w -= dist * 2
  h -= dist * 2
  if (Math.random() < w / (w + h)) {
    // top bottom
    x = Math.random() * w + x
    y = Math.random() < 0.5 ? y : y + h - 1
  } else {
    y = Math.random() * h + y
    x = Math.random() < 0.5 ? x : x + w - 1
  }
  return {
    x: x | 0,
    y: y | 0,
  }
}

function getAsteroidConfig(x?: number, y?: number): AsteroidConfig {
  return {
    id: getUUID(),
    x,
    y,
  }
}

function getUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
