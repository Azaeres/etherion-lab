import { Container, Text } from '@pixi/react'
import { styles } from 'src/utils/pixi-styles'
import Button from '../Experiment2/Button'
// import { OPTIONS } from 'src/components/PixiStage'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import { usePeer } from '@peerbit/react'
import { SetStateAction, useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Post, RoomDB } from './database'
import { SearchRequest } from '@peerbit/document'
import { getRoomNameFromPath } from './Lobby'
import { X25519Keypair } from '@peerbit/crypto'
import { TextStyle } from 'pixi.js'
import TextInput from './TextInput'
import { OPTIONS } from 'src/components/PixiStage'
import { ProgramClient } from '@peerbit/program'

export default function Room() {
  const navigate = useNextjsNavigate()
  const { peer, loading: loadingPeer } = usePeer()
  const [loading, setLoading] = useState(false)
  const room = useRef<RoomDB>()
  const [peerCounter, setPeerCounter] = useState<number>(1)
  const [text, setText] = useState('')
  const posts = useRef<Post[]>([])
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  const params = new URLSearchParams(document.location.search)
  const roomIdParam = params.get('c')

  useEffect(() => {
    if (!room?.current?.id || room?.current?.closed) {
      return
    }
    room?.current.messages.index.search(new SearchRequest({ query: [] }), {
      remote: { sync: true },
    })
  }, [room?.current?.id, room?.current?.closed, peerCounter])

  useEffect(() => {
    if (room.current || !roomIdParam || !peer) {
      return
    }
    room.current = undefined
    setLoading(true)
    const name = getRoomNameFromPath(roomIdParam)
    peer
      .open(new RoomDB({ name }), {
        args: { sync: () => true },
        existing: 'reuse',
      })
      .then(async (r) => {
        room.current = r
        r.messages.events.addEventListener('change', async (e) => {
          e.detail.added?.forEach((p) => {
            const ix = posts.current.findIndex((x) => x.id === p.id)
            if (ix === -1) {
              posts.current.push(p)
            } else {
              posts.current[ix] = p
            }
          })
          e.detail.removed?.forEach((p) => {
            const ix = posts.current.findIndex((x) => x.id === p.id)
            if (ix !== -1) {
              posts.current.splice(ix, 1)
            }
          })

          // Sort by time
          const wallTimes = new Map<string, bigint>()
          await Promise.all(
            posts.current.map(async (x) => {
              const message = room.current?.messages.index.index.get(x.id)
              const head = message?.context.head
              const entry = head && (await room.current?.messages.log.log.get(head))
              return {
                post: x,
                entry,
              }
            })
          ).then((entries) => {
            entries.forEach(({ post, entry }) => {
              if (entry) {
                wallTimes.set(post.id, entry.meta.clock.timestamp.wallTime)
              }
            })
          })

          posts.current.sort((a, b) => {
            const walltimeA = wallTimes.get(a.id)
            const walltimeB = wallTimes.get(b.id)
            if (walltimeA && walltimeB) {
              return Number(walltimeA - walltimeB)
            } else {
              return 0
            }
          })

          forceUpdate()
        })

        r.events.addEventListener('join', () => {
          //e) => {
          r.getReady().then((set) => setPeerCounter(set.size + 1))
        })

        r.events.addEventListener('leave', () => {
          //e) => {
          r.getReady().then((set) => setPeerCounter(set.size + 1))
        })
      })
      .catch((e) => {
        console.error('Failed to open room: ' + e.message)
        // alert('Failed top open room: ' + e.message)
        throw e
      })
      .finally(() => {
        setLoading(false)
      })
  }, [roomIdParam, peer?.identity.publicKey.hashcode()])
  console.log(' > posts:', posts)
  console.log(' > text:', text)

  const createPost = useCallback(async () => {
    if (!room || !peer) {
      return
    }
    const exportedKeypair = await peer.keychain.exportByKey(peer.identity.publicKey)
    if (!exportedKeypair) {
      return
    }
    room.current?.messages
      .put(new Post({ message: text, from: peer.identity.publicKey }), {
        encryption: {
          // TODO do once for performance
          keypair: await X25519Keypair.from(exportedKeypair),
          receiver: {
            payload: [],
            meta: [],
            signatures: [],
          },
        },
      })
      .then(() => {
        setText('')
        forceUpdate()
      })
      .catch((e) => {
        console.error('Failed to create message: ' + e.message)
        // alert('Failed to create message: ' + e.message)
        throw e
      })
  }, [text, room, peer])

  return (
    <>
      <Button
        text="&lsaquo;"
        x={40}
        y={50}
        width={100}
        height={100}
        onPress={navigate('experiment4')}
      />
      {loading || loadingPeer ? (
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
          x={180}
          y={60}
        />
      ) : (
        <RoomDetails
          room={room.current}
          posts={posts.current}
          text={text}
          setText={setText}
          createPost={createPost}
          peer={peer}
        />
      )}
    </>
  )
}

const selfStyle = new TextStyle({
  dropShadow: true,
  dropShadowAlpha: 0.8,
  fill: '0x55cc55',
  fontSize: 38,
  fontFamily: 'Arial',
  fontWeight: 'bold',
})

interface RoomDetailsProps {
  room?: RoomDB
  posts?: Post[]
  text: string
  peer?: ProgramClient
  setText: (value: SetStateAction<string>) => void
  createPost?: () => void
}
function RoomDetails(props: RoomDetailsProps) {
  const { room, posts, text, setText, createPost, peer } = props
  const onTextInputKeyup = useCallback(
    (ev: number) => {
      if (ev === 13) {
        createPost?.()
      }
    },
    [createPost]
  )
  if (!room || !posts || !peer) {
    return
  }
  const buttonDisabled = !text
  const numToRemove = Math.max(0, posts.length - 12)
  const trimmedPosts = [...posts]
  trimmedPosts.splice(0, numToRemove)
  return (
    <>
      <Text text={`Room ${room.name}`} style={styles.largeBody} x={180} y={60} />
      <TextInput
        text={text}
        onChange={setText}
        x={40}
        y={OPTIONS.height - 120}
        maxLength={120}
        onKeyup={onTextInputKeyup}
      />
      <Button
        text="⇪"
        x={600}
        y={OPTIONS.height - 120}
        height={70}
        width={70}
        disabled={buttonDisabled}
        onPress={createPost}
      />
      {trimmedPosts.length > 0 ? (
        trimmedPosts.map((p, ix) => {
          return (
            <Container key={p.id} x={40} y={200 + 60 * ix}>
              <Text
                text={shortName(p.from.toString())}
                style={p.from.equals(peer.identity.publicKey) ? selfStyle : styles.smallBody}
              />
              <Text text={p.message} style={styles.smallBody} x={420} />
            </Container>
          )
        })
      ) : (
        <Text text="No messages found!" style={styles.smallBody} x={40} y={200} />
      )}
    </>
  )
}

const shortName = (name: string) => {
  return name.substring(0, 14) + '...' + name.substring(name.length - 3, name.length)
}
