import { ParallaxLayer } from 'pixi-react-parallax'
import { Vec2Meters } from 'src/utils/physics'
// import DustSpawnManager from '../world-objects/Dust/DustSpawnManager'
import { worldObjectMap } from '../world-objects'
import { DepthStructuredManifests, WorldObjectManifest } from '../database/WorldObject'
// import objectMap from 'src/utils/objectMap'
import objectReduce from 'just-reduce-object'

interface ManifestationBoundaryProps {
  depthStructuredManifests: DepthStructuredManifests
  cameraPosition?: Vec2Meters
  cameraVelocity?: Vec2Meters
}

export default function ManifestationBoundary(props: ManifestationBoundaryProps) {
  const { depthStructuredManifests, cameraPosition, cameraVelocity } = props
  // console.log('ManifestationBoundary  > worldObjectOrigins:', worldObjectOrigins)
  // const unmanifest = useCallback(
  //   (id: string) => {
  //     return () => {
  //       console.log('unmanifest  > id:', id)
  //       const indexOfWorldObjectToUnmanifest = worldObjects.findIndex((worldObject) => {
  //         return worldObject.id === id
  //       })
  //       const newCollection = [...worldObjects]
  //       newCollection.splice(indexOfWorldObjectToUnmanifest, 1)
  //       setWorldObjects(newCollection)
  //     }
  //   },
  //   [setWorldObjects, worldObjects]
  // )
  // console.log('ManifestationBoundary render  :')
  return (
    <>
      {objectReduce<DepthStructuredManifests, JSX.Element[]>(
        depthStructuredManifests,
        (acc, zIndex, layer) => {
          return [
            ...acc,
            <ParallaxLayer key={zIndex} zIndex={Number(zIndex)}>
              {layer.map((worldObjectManifest) => {
                const { worldObjectModel, unmanifest } = worldObjectManifest
                const { component } = worldObjectModel
                const WorldObjectComponent = worldObjectMap[component].Component
                // console.log(
                //   'ManifestationBoundary map render  > worldObjectModel.id:',
                //   worldObjectModel.id
                // )
                // console.log('ManifestationBoundary map > WorldObjectComponent:', WorldObjectComponent)
                // console.log('origins map  > worldObjectModel:', worldObjectModel)
                return (
                  <WorldObjectComponent
                    key={worldObjectModel.id}
                    {...worldObjectModel}
                    unmanifest={unmanifest}
                    cameraPositionX={cameraPosition?.x}
                    cameraPositionY={cameraPosition?.y}
                    cameraVelocityX={cameraVelocity?.x}
                    cameraVelocityY={cameraVelocity?.y}
                  />
                )
              })}
            </ParallaxLayer>,
          ]
        },
        []
      )}
    </>
  )
  // return (
  //   <>
  //     {worldObjectManifests.map((worldObjectManifest) => {
  //       const { worldObjectModel, unmanifest } = worldObjectManifest
  //       const { component } = worldObjectModel
  //       const WorldObjectComponent = worldObjectMap[component].Component
  //       // console.log('ManifestationBoundary map > WorldObjectComponent:', WorldObjectComponent)
  //       // console.log('origins map  > worldObjectModel:', worldObjectModel)
  //       return (
  //         <WorldObjectComponent
  //           key={worldObjectModel.id}
  //           {...worldObjectModel}
  //           unmanifest={unmanifest}
  //           cameraPosition={cameraPosition}
  //           cameraVelocity={cameraVelocity}
  //         />
  //       )
  //     })}
  //   </>
  // )
}

// ManifestationBoundary.whyDidYouRender = true

export function getDepthStructuredManifests(
  worldObjectManifests: WorldObjectManifest[]
): DepthStructuredManifests {
  const result = worldObjectManifests.reduce<DepthStructuredManifests>(
    (acc, worldObjectManifest) => {
      const { worldObjectModel } = worldObjectManifest
      const zIndex = worldObjectModel.pos_z
      const layer = acc[zIndex]
      if (layer === undefined) {
        return { ...acc, [zIndex]: [worldObjectManifest] }
      } else {
        const newLayer = [...layer, worldObjectManifest]
        return { ...acc, [zIndex]: newLayer }
      }
    },
    {}
  )
  return result
}
