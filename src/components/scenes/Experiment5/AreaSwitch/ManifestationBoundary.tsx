import { ParallaxLayer } from 'pixi-react-parallax'
import { Vec2Meters } from 'src/utils/physics'
// import DustSpawnManager from '../world-objects/Dust/DustSpawnManager'
import { worldObjectMap } from '../world-objects'
import { DepthStructuredManifests } from '../database/WorldObject'
// import objectMap from 'src/utils/objectMap'
import objectReduce from 'just-reduce-object'

interface ManifestationBoundaryProps {
  depthStructuredManifests?: DepthStructuredManifests
  cameraPosition?: Vec2Meters
  cameraVelocity?: Vec2Meters
}

export default function ManifestationBoundary(props: ManifestationBoundaryProps) {
  const { depthStructuredManifests, cameraPosition, cameraVelocity } = props
  if (depthStructuredManifests === undefined) return null
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
                const WorldObjectComponent = worldObjectMap[component]
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
}

// ManifestationBoundary.whyDidYouRender = true

export function getDepthStructuredManifests(
  ...depthStructuredManifestsToMerge: DepthStructuredManifests[]
): DepthStructuredManifests | undefined {
  // console.log('useWorldObjectOrigins  > args:', args)
  // console.log(
  //   'getDepthStructuredManifests  > depthStructuredManifestsToMerge:',
  //   depthStructuredManifestsToMerge
  // )
  const manifestToMergeInto = depthStructuredManifestsToMerge.shift()
  if (manifestToMergeInto) {
    return depthStructuredManifestsToMerge.reduce((acc, manifestToMerge) => {
      // console.log('useWorldObjectOrigins  > arg:', arg)
      // console.log(' > worldObjectModelCollection:', worldObjectModelCollection)
      // console.log(' > unmanifest:', unmanifest)
      // const origins = depthStructuredCollection.map((worldObjectModel) => {
      //   // console.log('map  > worldObjectModel:', worldObjectModel)
      //   return createWorldObjectManifest(worldObjectModel, () => unmanifest(worldObjectModel.id))
      // })
      // return [...acc, ...origins]
      return mergeDepthStructuredCollectionManifests(acc, manifestToMerge)
    }, manifestToMergeInto)
  }
}

function mergeDepthStructuredCollectionManifests(
  manifestsToMergeInto: DepthStructuredManifests,
  manifestsToMerge: DepthStructuredManifests
): DepthStructuredManifests {
  // console.log(
  //   'mergeDepthStructuredCollectionManifests  > manifestsToMergeInto:',
  //   manifestsToMergeInto
  // )
  // console.log(' > manifestsToMerge:', manifestsToMerge)
  // const { worldObjectModel, unmanifest } = manifestToMergeInto
  // const [collection2, unmanifest2] = manifestToMerge
  // const result = { ...collection1 }
  const result = objectReduce(
    manifestsToMerge,
    (acc, zIndex, layerManifests) => {
      // const [zIndex, worldObjectCollection] = layer
      if (Object.prototype.hasOwnProperty.call(acc, zIndex)) {
        // zIndex is in both manifests.
        const mergeInto = acc[zIndex]!
        // console.log('merge  > mergeInto:', mergeInto)
        // console.log(' merge: acc[zIndex]:', acc[zIndex])
        return { ...acc, [zIndex]: [...mergeInto, ...layerManifests] }
      } else {
        // zIndex does NOT exist in manifest to merge into.
        return { ...acc, [zIndex]: layerManifests }
      }
      return acc
    },
    manifestsToMergeInto
  )
  // console.log('merge  > result:', result)
  return result
}
