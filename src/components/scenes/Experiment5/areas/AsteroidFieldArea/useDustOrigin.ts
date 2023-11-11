import { useCallback, useEffect, useRef, useState } from 'react'
import { Meters, Pixels, Vec2Meters, metersFromPx, pxFromMeters } from 'src/utils/physics'
import { Vec2 } from 'planck'
import {
  DepthStructuredManifests,
  WorldObjectId,
  WorldObjectManifest,
  WorldObjectModel,
} from '../../database/WorldObject'
import { v4 as uuid } from 'uuid'
import { AreaId } from '../../AreaSwitch/list'
import { PeerId } from '../../database'
import objectMap from 'just-map-values'

export type DustLayerConfig = {
  density: number // The count to populate.
  generationDistance: Meters
  cullingDistance: Meters
}

export type DustConfig = {
  [zIndex: string]: DustLayerConfig
}

export const DEFAULT_DUST_CONFIG: DustConfig = {
  '-300': {
    density: 10, // 40
    generationDistance: 30.0 as Meters,
    cullingDistance: 31.0 as Meters,
  },
  '-800': {
    density: 25, // 30
    generationDistance: 48.0 as Meters,
    cullingDistance: 49.0 as Meters,
  },
  '-1200': {
    density: 40, // 50
    generationDistance: 65.0 as Meters,
    cullingDistance: 66.0 as Meters,
  },
  '-3500': {
    density: 50, // 50
    generationDistance: 170.0 as Meters,
    cullingDistance: 171.0 as Meters,
  },
} as const

export function useDustOrigin(
  dustConfig: DustConfig,
  area: AreaId,
  upstreamPeer: PeerId,
  cameraPosition?: Vec2Meters
): DepthStructuredManifests {
  const [initialSetup, setInitialSetup] = useState(true)
  const depthStructuredManifests = useRef<DepthStructuredManifests>({})
  const populateLayer = useCallback(
    (
      dustLayerConfig: DustLayerConfig,
      layerManifests: WorldObjectManifest[],
      zIndex: number
    ): WorldObjectManifest[] => {
      // console.log('populateLayer()  > dustLayerConfig:', dustLayerConfig)
      // console.log(' > layerManifests:', layerManifests)
      // console.log(' > zIndex:', zIndex)
      if (!cameraPosition) return layerManifests

      const { density, generationDistance, cullingDistance } = dustLayerConfig
      // Populates the collection.
      const availableSlots = density - layerManifests.length
      // console.log(' > availableSlots:', availableSlots)
      if (availableSlots > 0) {
        const newCollection = [...layerManifests]
        if (initialSetup) {
          // Initial setup.
          for (let index = 0; index < availableSlots; index++) {
            // Factor in cameraPosition?
            const x = (Math.random() * generationDistance * 2 - generationDistance) as Meters
            const y = (Math.random() * generationDistance * 2 - generationDistance) as Meters
            const dustModel = getDustModel(x, y, zIndex, area, upstreamPeer, cullingDistance)
            const dustUnmanifest = () => unmanifest(dustModel.id)
            const dustManifest = getDustManifest(dustModel, dustUnmanifest)
            newCollection.push(dustManifest)
          }
          setInitialSetup(false)
        } else {
          // console.log('Populating collection. > availableSlots:', availableSlots)
          for (let index = 0; index < availableSlots; index++) {
            // console.log('getting random point  > generationDistance:', generationDistance)
            // console.log(' > cameraPosition:', cameraPosition)
            const randomPoint = getRandomPointOnGenerationBoundary(
              cameraPosition,
              generationDistance
            )
            // console.log(' > randomPoint:', randomPoint)
            const dustModel = getDustModel(
              -randomPoint.x as Meters,
              -randomPoint.y as Meters,
              zIndex,
              area,
              upstreamPeer,
              cullingDistance
            )
            const dustUnmanifest = () => unmanifest(dustModel.id)
            const dustManifest = getDustManifest(dustModel, dustUnmanifest)
            newCollection.push(dustManifest)
          }
        }
        return newCollection
      } else {
        return layerManifests
      }
    },
    [area, cameraPosition?.x, cameraPosition?.y, initialSetup, upstreamPeer]
  )
  useEffect(() => {
    // dustConfig -> depthStructuredManifests
    // console.log('dustConfig -> depthStructuredManifests > dustConfig:', dustConfig)
    // <
    //   WorldObjectModel[],
    //   DustLayerConfig
    // >
    const newDepthStructuredManifest: DepthStructuredManifests = objectMap<
      DustLayerConfig,
      WorldObjectManifest[]
    >(dustConfig, (dustLayerConfig, zIndex) => {
      // console.log('objMap (dustConfig -> layerCollections) > dustLayerConfig:', dustLayerConfig)
      // console.log(' > zIndex:', zIndex)
      // console.log(' > depthStructuredManifests, zIndex:', depthStructuredManifests, zIndex)
      const layerManifests = depthStructuredManifests.current[zIndex] || []
      // console.log(
      //   'useDustManifest dustConfig -> depthStructuredManifests > layerManifests:',
      //   layerManifests
      // )
      const result = populateLayer(dustLayerConfig, layerManifests, Number(zIndex))
      // console.log('populateLayer => result', result)
      return result
    })
    // console.log(
    //   '[dustConfig -> layerCollections] setting  > newLayerCollections:',
    //   newLayerCollections
    // )
    depthStructuredManifests.current = newDepthStructuredManifest
  }, [dustConfig, populateLayer])
  const unmanifest = useCallback((id: string) => {
    // console.log('unmanifest  > id:', id)
    const unmanifestLayerCollections = (id: string, zIndex: string) => {
      // console.log('unmanifestLayerCollections  > id, zIndex:', id, zIndex)
      // console.log(' > depthStructuredManifests.current:', depthStructuredManifests.current)
      // console.log(' > typeof zIndex:', typeof zIndex)
      const worldObjectManifests = depthStructuredManifests.current[zIndex]
      // console.log(' > worldObjectManifests:', worldObjectManifests)
      if (worldObjectManifests) {
        const indexOfDustToDestroy = worldObjectManifests.findIndex((dustManifest) => {
          return dustManifest.worldObjectModel.id === id
        })
        if (indexOfDustToDestroy !== -1) {
          // console.log('found  > indexOfDustToDestroy:', indexOfDustToDestroy)
          const newWorldObjectManifests = [...worldObjectManifests]
          newWorldObjectManifests.splice(indexOfDustToDestroy, 1)
          const currentDepthStructuredManifests = depthStructuredManifests.current
          depthStructuredManifests.current = {
            ...currentDepthStructuredManifests,
            [zIndex]: newWorldObjectManifests,
          }
        }
      } else {
        console.warn('Warning: Unmanifest layer given non-existent zIndex: ', zIndex)
      }
    }
    // console.log('unmanifest()  > id:', id)
    // console.log('keys:  > depthStructuredManifests.current:', depthStructuredManifests.current)
    Object.keys(depthStructuredManifests.current).forEach((zIndex) => {
      // console.log(' > zIndex:', zIndex)
      unmanifestLayerCollections(id, zIndex)
    })
  }, [])
  // console.log('useDustManifest() > depthStructuredManifests:', depthStructuredManifests)
  return depthStructuredManifests.current
}

function getDustManifest(
  worldObjectModel: WorldObjectModel,
  unmanifest: () => void
): WorldObjectManifest {
  return {
    worldObjectModel,
    unmanifest,
  }
}

function getDustModel(
  x: Meters,
  y: Meters,
  z: number,
  area: AreaId,
  upstreamPeer: PeerId,
  cullingDistance?: Meters
): WorldObjectModel {
  return {
    id: uuid() as WorldObjectId,
    component: 'Dust',
    area,
    upstream_peer: upstreamPeer,
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
    pxFromMeters((cameraPosition.x - generationDistance) as Meters),
    pxFromMeters((cameraPosition.y - generationDistance) as Meters),
    pxFromMeters((generationDistance * 2) as Meters),
    pxFromMeters((generationDistance * 2) as Meters),
    pxFromMeters(0.01 as Meters),
    pxFromMeters(0.01 as Meters)
  )
  return new Vec2(
    metersFromPx(randomPoint.x as Pixels),
    metersFromPx(-randomPoint.y as Pixels)
  ) as Vec2Meters
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
