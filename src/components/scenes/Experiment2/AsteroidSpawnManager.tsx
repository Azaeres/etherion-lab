import { useCallback, useContext, useEffect, useState } from 'react'
import { Vec2 } from 'planck'
import { ParallaxCameraContext } from 'pixi-react-parallax'
import Asteroid from './Asteroid'
import { useTick } from '@pixi/react'
import getUUID from 'src/app/utils/getUUID'
import { Pixels, Vec2Pixels } from 'src/utils/physics'

export interface AsteroidSpawnManagerProps {
  // The count of asteroids to populate.
  density?: number
  physical?: boolean
  generationDistance?: number
  cullingDistance?: number
}

type AsteroidConfig = {
  id: string
  x?: Pixels
  y?: Pixels
  physical?: boolean
}

const GENERATION_DISTANCE = 5000
const DEFAULT_DENSITY = 30

export default function AsteroidSpawnManager(props: AsteroidSpawnManagerProps) {
  const {
    density = DEFAULT_DENSITY,
    physical = true,
    generationDistance = GENERATION_DISTANCE,
    cullingDistance,
  } = props
  const camera = useContext(ParallaxCameraContext)
  const [cameraPosition, setCameraPosition] = useState<Vec2Pixels>()
  useTick(() => {
    if (camera) {
      // console.log('setting camera pos  > camera.x, camera.y:', camera.x, camera.y)
      setCameraPosition(new Vec2(camera.x, camera.y) as Vec2Pixels)
    }
  })
  // console.log(' > camera:', camera, cameraPosition)
  const [asteroids, setAsteroids] = useState<AsteroidConfig[]>([])
  const [initialSetup, setInitialSetup] = useState(true)
  useEffect(() => {
    if (!cameraPosition) return

    // Populates the collection.
    const availableSlots = density - asteroids.length
    if (availableSlots > 0) {
      const newCollection = [...asteroids]
      if (initialSetup) {
        // Initial setup.
        for (let index = 0; index < availableSlots; index++) {
          const asteroidConfig = getAsteroidConfig(physical)
          newCollection.push(asteroidConfig)
        }
        setInitialSetup(false)
      } else {
        for (let index = 0; index < availableSlots; index++) {
          const randomPoint = getRandomPointOnGenerationBoundary(
            cameraPosition,
            generationDistance as Pixels
          )
          const asteroidConfig = getAsteroidConfig(
            physical,
            -randomPoint.x as Pixels,
            physical ? randomPoint.y : (-randomPoint.y as Pixels)
          )
          newCollection.push(asteroidConfig)
        }
      }
      setAsteroids(newCollection)
    }
  }, [asteroids, cameraPosition, density, generationDistance, initialSetup, physical])
  // console.log(' > asteroids:', asteroids)
  const destroyAsteroid = useCallback(
    (id: string) => {
      // console.log('destroying  > id:', id)
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
          <Asteroid
            key={asteroidConfig.id}
            cameraPosition={cameraPosition}
            destroy={() => {
              destroyAsteroid(asteroidConfig.id)
            }}
            cullingDistance={cullingDistance}
            {...asteroidConfig}
          />
        )
      })}
    </>
  )
}

function getRandomPointOnGenerationBoundary(
  cameraPosition: Vec2Pixels,
  generationDistance: Pixels
) {
  // console.log(
  //   'getRandomPointOnGenerationBoundary  > cameraPosition, generationDistance:',
  //   cameraPosition,
  //   generationDistance
  // )
  const randomPoint = _randomPointNearRect(
    cameraPosition.x - generationDistance,
    cameraPosition.y - generationDistance,
    generationDistance * 2,
    generationDistance * 2,
    10,
    10
  )
  return new Vec2(randomPoint.x, randomPoint.y) as Vec2Pixels
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

function getAsteroidConfig(physical: boolean, x?: Pixels, y?: Pixels): AsteroidConfig {
  return {
    id: getUUID(),
    x,
    y,
    physical,
  }
}
