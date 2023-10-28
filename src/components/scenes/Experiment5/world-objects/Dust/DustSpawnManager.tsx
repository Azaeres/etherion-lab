import { useEffect, useState } from 'react'
import { Vec2 } from 'planck'
import { Meters, Pixels, Vec2Meters, metersFromPx } from 'src/utils/physics'
import { useCameraPositionUpdateListener } from '../events'
import getUUID from 'src/app/utils/getUUID'

export interface DustSpawnManagerProps {
  density?: number // The count to populate.
  generationDistance?: Meters
  cullingDistance?: Meters
}

type DustConfig = {
  id: string
  x: Meters
  y: Meters
}

const GENERATION_DISTANCE = metersFromPx(4000 as Pixels)
const DEFAULT_DENSITY = 100

export default function DustSpawnManager(props: DustSpawnManagerProps) {
  const {
    density = DEFAULT_DENSITY,
    generationDistance = GENERATION_DISTANCE,
    // cullingDistance,
  } = props
  const [cameraPosition, setCameraPosition] = useState<Vec2Meters>()
  useCameraPositionUpdateListener(setCameraPosition)
  const [collection, setCollection] = useState<DustConfig[]>([])
  const [initialSetup, setInitialSetup] = useState(true)
  useEffect(() => {
    if (!cameraPosition) return

    // Populates the collection.
    const availableSlots = density - collection.length
    if (availableSlots > 0) {
      const newCollection = [...collection]
      if (initialSetup) {
        // Initial setup.
        for (let index = 0; index < availableSlots; index++) {
          const x = (Math.random() * generationDistance * 2 - generationDistance) as Meters
          const y = (Math.random() * generationDistance * 2 - generationDistance) as Meters
          const dustConfig = getDustConfig(x, y)
          newCollection.push(dustConfig)
        }
        setInitialSetup(false)
      } else {
        for (let index = 0; index < availableSlots; index++) {
          const randomPoint = getRandomPointOnGenerationBoundary(cameraPosition, generationDistance)
          const dustConfig = getDustConfig(-randomPoint.x as Meters, -randomPoint.y as Meters)
          newCollection.push(dustConfig)
        }
      }
      setCollection(newCollection)
    }
  }, [cameraPosition, collection, density, generationDistance, initialSetup])
  // const destroyDust = useCallback(
  //   (id: string) => {
  //     const indexOfDustToDestroy = collection.findIndex((dustConfig) => {
  //       return dustConfig.id === id
  //     })
  //     const newCollection = [...collection]
  //     newCollection.splice(indexOfDustToDestroy, 1)
  //     setCollection(newCollection)
  //   },
  //   [collection]
  // )
  return null
  // return (
  //   <>
  //     {collection.map((dustConfig) => {
  //       return (
  //         <Dust
  //           key={dustConfig.id}
  //           cullingDistance={cullingDistance}
  //           cameraPosition={cameraPosition}
  //           {...dustConfig}
  //           destroy={() => {
  //             destroyDust(dustConfig.id)
  //           }}
  //         />
  //       )
  //     })}
  //   </>
  // )
}

function getDustConfig(x: Meters, y: Meters) {
  return {
    id: getUUID(),
    x,
    y,
  } as DustConfig
}

function getRandomPointOnGenerationBoundary(
  cameraPosition: Vec2Meters,
  generationDistance: Meters
) {
  const randomPoint = _randomPointNearRect(
    cameraPosition.x - generationDistance,
    cameraPosition.y - generationDistance,
    generationDistance * 2,
    generationDistance * 2,
    10,
    10
  )
  return new Vec2(randomPoint.x, -randomPoint.y) as Vec2Meters
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
