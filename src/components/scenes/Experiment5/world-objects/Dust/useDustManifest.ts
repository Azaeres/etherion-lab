import { useCallback, useEffect, useState } from 'react'
import { Meters, Vec2Meters } from 'src/utils/physics'
import { Vec2 } from 'planck'
import {
  DepthStructuredCollection,
  WorldObjectCollectionManifest,
  WorldObjectModel,
} from '../../database/WorldObject'
import { v4 as uuid } from 'uuid'
import { AreaId } from '../../AreaSwitch/areas'
import { PeerId } from '../../database'
import objectMap from 'src/utils/objectMap'
// import objectMap from 'just-map-object'

// const DEFAULT_DENSITY = 100
// const GENERATION_DISTANCE = metersFromPx(4000 as Pixels)

export type DustLayerConfig = {
  density: number // The count to populate.
  generationDistance: Meters
  cullingDistance: Meters
}

export type DustConfig = {
  [zIndex: string]: DustLayerConfig
}

export function useDustManifest(
  dustConfig: DustConfig,
  area: AreaId,
  owner: PeerId,
  cameraPosition?: Vec2Meters
): WorldObjectCollectionManifest {
  const [initialSetup, setInitialSetup] = useState(true)
  const [layerCollections, setLayerCollections] = useState<DepthStructuredCollection>({})
  const populateLayer = useCallback(
    (
      dustLayerConfig: DustLayerConfig,
      layerCollection: WorldObjectModel[],
      zIndex: number
    ): WorldObjectModel[] => {
      if (!cameraPosition) return layerCollection

      // console.log('populateLayer()  > dustLayerConfig:', dustLayerConfig)
      // console.log(' > layerCollection:', layerCollection)
      // console.log(' > zIndex:', zIndex)
      const { density, generationDistance, cullingDistance } = dustLayerConfig
      // Populates the collection.
      const availableSlots = density - layerCollection.length
      // console.log(' > availableSlots:', availableSlots)
      if (availableSlots > 0) {
        const newCollection = [...layerCollection]
        if (initialSetup) {
          // Initial setup.
          for (let index = 0; index < availableSlots; index++) {
            // Factor in cameraPosition?
            const x = (Math.random() * generationDistance * 2 - generationDistance) as Meters
            const y = (Math.random() * generationDistance * 2 - generationDistance) as Meters
            const dustModel = getDustModel(x, y, zIndex, area, owner, cullingDistance)
            newCollection.push(dustModel)
          }
          setInitialSetup(false)
        } else {
          // console.log('Populating collection. > availableSlots:', availableSlots)
          for (let index = 0; index < availableSlots; index++) {
            const randomPoint = getRandomPointOnGenerationBoundary(
              cameraPosition,
              generationDistance
            )
            const dustModel = getDustModel(
              -randomPoint.x as Meters,
              -randomPoint.y as Meters,
              zIndex,
              area,
              owner,
              cullingDistance
            )
            // console.log(' > dustModel:', dustModel)
            newCollection.push(dustModel)
          }
        }
        return newCollection
      } else {
        return layerCollection
      }
    },
    [area, cameraPosition?.x, cameraPosition?.y, initialSetup, owner]
  )
  useEffect(() => {
    // dustConfig -> layerCollections
    // console.log(' > dustConfig:', dustConfig)
    const newLayerCollections: DepthStructuredCollection = objectMap<
      WorldObjectModel[],
      DustLayerConfig
    >(dustConfig, (zIndex, dustLayerConfig) => {
      const layerCollection = layerCollections[zIndex] || []
      // console.log('objMap (dustConfig -> layerCollections) > dustLayerConfig:', dustLayerConfig)
      // console.log(' > layerCollection:', layerCollection)
      // console.log(' > zIndex:', zIndex)
      const result = populateLayer(dustLayerConfig, layerCollection, Number(zIndex))
      // console.log('populateLayer => result', result)
      return result
    })
    // console.log(
    //   '[dustConfig -> layerCollections] setting  > newLayerCollections:',
    //   newLayerCollections
    // )
    setLayerCollections(newLayerCollections)
  }, [dustConfig, populateLayer])
  const [totalCollection, setTotalCollection] = useState<WorldObjectModel[]>([])
  useEffect(() => {
    // layerCollections -> totalCollection
    // console.log('layerCollections -> setTotalCollection > layerCollections:', layerCollections)
    const allCollections = Object.values(layerCollections)
    const newTotalCollection = allCollections.reduce((acc, collection) => {
      return [...acc, ...collection]
    }, [])
    // console.log('[layerCollections -> totalCollection]  > newTotalCollection:', newTotalCollection)
    setTotalCollection(newTotalCollection)
  }, [layerCollections])
  const unmanifest = useCallback(
    (id: string) => {
      const unmanifestLayerCollections = (id: string, zIndex: string) => {
        // console.log('unmanifestLayerCollections  > id, zIndex:', id, zIndex)
        // console.log(' > layerCollections:', layerCollections)
        // console.log(' > typeof zIndex:', typeof zIndex)
        const layerCollection = layerCollections[zIndex]
        // console.log(' > layerCollection:', layerCollection)
        if (layerCollection) {
          const indexOfDustToDestroy = layerCollection.findIndex((dustModel) => {
            return dustModel.id === id
          })
          if (indexOfDustToDestroy !== -1) {
            // console.log('found  > indexOfDustToDestroy:', indexOfDustToDestroy)
            const newLayerCollection = [...layerCollection]
            newLayerCollection.splice(indexOfDustToDestroy, 1)
            setLayerCollections((currentCollections) => {
              return { ...currentCollections, [zIndex]: newLayerCollection }
            })
          }
          // else {
          //   console.warn('Warning: Unmanifest layer given non-existent world object id: ', id)
          // }
        } else {
          console.warn('Warning: Unmanifest layer given non-existent zIndex: ', zIndex)
        }
      }
      // console.log('unmanifest()  > id:', id)
      Object.keys(layerCollections).forEach((zIndex) => {
        unmanifestLayerCollections(id, zIndex)
      })
    },
    [layerCollections]
  )
  return [totalCollection, unmanifest]
}

function getDustModel(
  x: Meters,
  y: Meters,
  z: number,
  area: AreaId,
  owner: PeerId,
  cullingDistance?: Meters
): WorldObjectModel {
  return {
    id: uuid(),
    component: 'Dust',
    area,
    owner,
    orphan: false,
    pos_x: x,
    pos_y: y,
    pos_z: z,
    data: {
      cullingDistance,
    },
  }
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
