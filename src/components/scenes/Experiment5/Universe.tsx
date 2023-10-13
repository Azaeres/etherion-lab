import { usePeer } from '@peerbit/react'
import { Container, Text } from '@pixi/react'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { styles } from 'src/utils/pixi-styles'
// import { LobbyDB, RoomDB } from './ChatDB'
import { SearchRequest } from '@peerbit/document'
import { TextStyle } from 'pixi.js'
import Button from '../Experiment2/Button'
import getUUID from 'src/app/utils/getUUID'
import { OPTIONS } from 'src/components/PixiStage'
import useNextjsRouter from 'src/app/hooks/useNextjsRouter'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import { UniverseDB } from './database/UniverseDB'
import { SpaceDB } from './database/SpaceDB'
import usePeerList from '../Experiment4/hooks/usePeerList'
import { getIdFromPeer } from './database'
// import usePeerList from './hooks/usePeerList'
// import { randomBytes } from '@peerbit/crypto'

// Same universe for all users of this app
const universeId = new Uint8Array([
  103, 200, 189, 231, 98, 181, 93, 65, 220, 157, 140, 183, 43, 48, 175, 69, 208, 31, 52, 223, 141,
  242, 82, 28, 217, 160, 100, 16, 179, 60, 61, 0,
])

export default function Universe() {
  const { peer, loading: loadingPeer, status } = usePeer()
  const [universe, setUniverse] = useState<UniverseDB>()
  const spaces = useRef<SpaceDB[]>([])
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  const { peerCount, peerList } = usePeerList(universe?.spaces)

  console.log('Universe render > status:', status)
  console.log(' > peerCount, peerList:', peerCount, peerList)

  const peerId = getIdFromPeer(peer)
  useEffect(() => {
    console.log('???', peerId)
    if (!peer || !peerId) {
      return
    }
    peer
      .open(
        new UniverseDB({
          id: universeId, // new Uint8Array(32), // 0,0,....0 choose this dynamically instead? Now it is static, => same lobby for all
        }),
        { args: { sync: () => true }, existing: 'reuse' }
      )
      .then(async (universe) => {
        console.log('OPEN UNIVERSE', universe)
        setUniverse(universe)
        const addSpaceToUniverse = (spaceToAdd: SpaceDB[], reset?: boolean) => {
          if (reset) {
            spaces.current = []
          }
          for (const space of spaceToAdd) {
            const ix = spaces.current.findIndex((x) => x.id === space.id)
            if (ix === -1) {
              spaces.current.push(space)
            } else {
              spaces.current[ix] = space
            }
          }
          if (spaceToAdd.length > 0) {
            forceUpdate()
          }
        }
        universe.spaces.index.search(new SearchRequest(), {}).then((results, ...rest) => {
          console.log('Got search results  > results, rest:', results, rest)
          addSpaceToUniverse(results, true)
        })
        universe.spaces.events.addEventListener('change', async (e) => {
          // additions
          e.detail.added && addSpaceToUniverse(e.detail.added)

          // removals
          e.detail.removed?.forEach((p) => {
            const ix = spaces.current.findIndex((x) => x.id === p.id)
            if (ix !== -1) {
              spaces.current.splice(ix, 1)
            }
          })
          e.detail.removed && forceUpdate()
        })
      })
      .catch((e) => {
        console.log('Caught error!  :')
        console.error(e)
      })
  }, [peerId])

  console.log(' > spaces.current:', spaces.current)

  const createNewSpace = useCallback(() => {
    const nameTrimmed = getUUID()
    if (universe) {
      console.log('create space with name: ' + nameTrimmed)
      universe.spaces.put(new SpaceDB({ name: nameTrimmed })).catch((error) => {
        console.error(error)
        alert('Failed to create space: ' + error.message)
      })
    }
  }, [universe])
  const navigate = useNextjsNavigate()
  console.log(' > peers:', peerList)
  console.log(' > this peerId:', peerId)

  return (
    <>
      <Text text="Spaces" style={styles.largeBody} x={40} y={60} />
      <Text text={`Connection status: ${status}`} style={styles.smallBody} x={40} y={160} />
      <Text text={`Peers in universe: ${peerCount}`} style={styles.smallBody} x={40} y={220} />
      <Button
        text="&equiv; Menu"
        x={OPTIONS.width - 400}
        y={50}
        width={300}
        height={100}
        onPress={navigate('/')}
      />
      <Button
        text="New space"
        x={OPTIONS.width - 740}
        y={50}
        width={300}
        height={100}
        onPress={createNewSpace}
      />

      {loadingPeer ? (
        <Text
          text="Loading..."
          style={
            new TextStyle({
              dropShadow: true,
              dropShadowAlpha: 0.8,
              fill: '0xffffff',
              fontSize: 54,
            })
          }
          x={40}
          y={340}
        />
      ) : (
        <SpaceItem spaces={spaces.current} />
      )}
    </>
  )
}

interface SpaceItemProps {
  spaces: SpaceDB[]
}
function SpaceItem(props: SpaceItemProps) {
  const { spaces } = props
  const router = useNextjsRouter()
  const navigateToSpace = useCallback(
    (space: SpaceDB) => {
      const paramId = getSpacePath(space)
      console.log('Navigate to > space, paramId:', space, paramId)
      router?.push(`${document.location.pathname}?c=${paramId}`)
    },
    [router]
  )
  return spaces.length > 0 ? (
    <Container x={40} y={340}>
      {spaces.map((space, index) => (
        <Button
          key={space.id}
          text={space.name}
          x={40}
          y={140 * index}
          width={1000}
          height={100}
          onPress={() => navigateToSpace(space)}
        />
      ))}
    </Container>
  ) : (
    <Text text="No spaces found" style={styles.body} x={40} y={340} />
  )
}

export const getSpacePath = (space: string | SpaceDB) =>
  encodeURIComponent(space instanceof SpaceDB ? space.name : space)

export const getSpaceNameFromPath = (spaceName: string) => decodeURIComponent(spaceName)
