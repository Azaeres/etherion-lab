import { usePeer } from '@peerbit/react'
import { Container, Text } from '@pixi/react'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { styles } from 'src/utils/pixi-styles'
import { LobbyDB, RoomDB } from './database'
import { SearchRequest } from '@peerbit/document'
import { TextStyle } from 'pixi.js'
import Button from '../Experiment2/Button'
import getUUID from 'src/app/utils/getUUID'
import { OPTIONS } from 'src/components/PixiStage'
import useNextjsRouter from 'src/app/hooks/useNextjsRouter'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
// import { randomBytes } from '@peerbit/crypto'

// Same lobby for all users of this app
const lobbyId = new Uint8Array([
  103, 200, 189, 231, 98, 181, 93, 65, 220, 157, 140, 183, 43, 48, 175, 69, 208, 31, 52, 223, 141,
  242, 82, 28, 217, 160, 100, 16, 179, 60, 61, 0,
])

export default function Lobby() {
  const { peer, loading: loadingPeer } = usePeer()
  const [lobby, setLobby] = useState<LobbyDB>()
  const rooms = useRef<RoomDB[]>([])
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  const [peerCount, setPeerCount] = useState(1)

  // const bytes = randomBytes(32) as Uint8Array
  // console.log(' > bytes:', bytes.toString())

  useEffect(() => {
    console.log('???', peer?.identity.publicKey.hashcode())
    if (!peer?.identity.publicKey.hashcode()) {
      return
    }
    peer
      .open(
        new LobbyDB({
          id: lobbyId, // new Uint8Array(32), // 0,0,....0 choose this dynamically instead? Now it is static, => same lobby for all
        }),
        { args: { sync: () => true }, existing: 'reuse' }
      )
      .then(async (lobby) => {
        console.log('OPEN LOBBY', lobby)
        setLobby(lobby)
        const addToLobby = (toAdd: RoomDB[], reset?: boolean) => {
          if (reset) {
            rooms.current = []
          }
          for (const room of toAdd) {
            const ix = rooms.current.findIndex((x) => x.id === room.id)
            if (ix === -1) {
              rooms.current.push(room)
            } else {
              rooms.current[ix] = room
            }
          }
          if (toAdd.length > 0) {
            forceUpdate()
          }
        }
        lobby.rooms.index.search(new SearchRequest(), {}).then((results) => {
          addToLobby(results, true)

          // Get current peer count
          console.log('Get peer count...  :')
          lobby.rooms.getReady().then((set) => {
            console.log('lobby.rooms ready.then  > set:', set)
            return setPeerCount(set.size + 1)
          })
        })
        lobby.rooms.events.addEventListener('change', async (e) => {
          // additions
          e.detail.added && addToLobby(e.detail.added)

          // removals
          e.detail.removed?.forEach((p) => {
            const ix = rooms.current.findIndex((x) => x.id === p.id)
            if (ix !== -1) {
              rooms.current.splice(ix, 1)
            }
          })
          e.detail.removed && forceUpdate()
        })

        lobby.rooms.events.addEventListener('join', () => {
          lobby.rooms.getReady().then((set) => setPeerCount(set.size + 1))
        })

        lobby.rooms.events.addEventListener('leave', () => {
          lobby.rooms.getReady().then((set) => setPeerCount(set.size + 1))
        })
      })
      .catch((e) => {
        console.error(e)
      })
  }, [peer?.identity.publicKey.hashcode()])

  console.log(' > rooms.current:', rooms.current)

  const createNewRoom = useCallback(() => {
    const nameTrimmed = getUUID()
    if (lobby) {
      console.log('create room with name: ' + nameTrimmed)
      lobby.rooms.put(new RoomDB({ name: nameTrimmed })).catch((error) => {
        console.error(error)
        alert('Failed to create room: ' + error.message)
      })
    }
  }, [lobby])
  const navigate = useNextjsNavigate()

  return (
    <>
      <Button
        text="&equiv; Menu"
        x={OPTIONS.width - 400}
        y={50}
        width={300}
        height={100}
        onPress={navigate('/')}
      />
      <Text text="A P2P chat app" style={styles.largeBody} x={40} y={40} />
      <Text text={`Peers in lobby: ${peerCount}`} style={styles.body} x={40} y={140} />
      <Text text="Rooms" style={styles.body} x={40} y={240} />
      <Button
        text="New room"
        x={OPTIONS.width - 740}
        y={50}
        width={300}
        height={100}
        onPress={createNewRoom}
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
        <RoomItem rooms={rooms.current} />
      )}
    </>
  )
}

interface RoomItemProps {
  rooms: RoomDB[]
}
function RoomItem(props: RoomItemProps) {
  const { rooms } = props
  const router = useNextjsRouter()
  const goToRoom = useCallback(
    (room: RoomDB) => {
      const paramId = getRoomPath(room)
      console.log('Navigate  > room, paramId:', room, paramId)
      router?.push(`${document.location.pathname}?c=${paramId}`)
    },
    [router]
  )
  return rooms.length > 0 ? (
    <Container x={40} y={340}>
      {rooms.map((room, index) => (
        <Button
          key={room.id}
          text={room.name}
          x={40}
          y={140 * index}
          width={1000}
          height={100}
          onPress={() => goToRoom(room)}
        />
      ))}
    </Container>
  ) : (
    <Text text="No rooms found" style={styles.body} x={40} y={340} />
  )
}

export const getRoomPath = (room: string | RoomDB) =>
  encodeURIComponent(room instanceof RoomDB ? room.name : room)

export const getRoomNameFromPath = (roomName: string) => decodeURIComponent(roomName)
