import {
  WorldObjectCollectionManifest,
  WorldObjectManifest,
  WorldObjectModel,
} from '../database/WorldObject'

export default function getWorldObjectManifests(
  ...collectionManifests: WorldObjectCollectionManifest[]
): WorldObjectManifest[] {
  // console.log('useWorldObjectOrigins  > args:', args)
  const result = collectionManifests.reduce<WorldObjectManifest[]>((acc, arg) => {
    // console.log('useWorldObjectOrigins  > arg:', arg)
    const [worldObjectModelCollection, unmanifest] = arg
    // console.log(' > worldObjectModelCollection:', worldObjectModelCollection)
    // console.log(' > unmanifest:', unmanifest)
    const origins = worldObjectModelCollection.map((worldObjectModel) => {
      // console.log('map  > worldObjectModel:', worldObjectModel)
      return createWorldObjectManifest(worldObjectModel, () => unmanifest(worldObjectModel.id))
    })
    return [...acc, ...origins]
  }, [])
  // console.log(' > result:', result)
  return result
}

function createWorldObjectManifest(
  worldObjectModel: WorldObjectModel,
  unmanifest: () => void
): WorldObjectManifest {
  // console.log(
  //   'createWorldObjectOrigin  > worldObjectModel, unmanifest:',
  //   worldObjectModel,
  //   unmanifest
  // )
  return {
    worldObjectModel,
    unmanifest,
  }
}
