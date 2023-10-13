import { Container, Text } from '@pixi/react'
import { styles } from 'src/utils/pixi-styles'
import Button from '../Experiment2/Button'
// import { OPTIONS } from 'src/components/PixiStage'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import { usePeer } from '@peerbit/react'
import { SetStateAction, useCallback, useEffect, useReducer, useRef, useState } from 'react'
// import { Post, RoomDB } from './ChatDB'
import { SearchRequest } from '@peerbit/document'
// import { getRoomNameFromPath } from './Lobby'
import { X25519Keypair } from '@peerbit/crypto'
import { TextStyle } from 'pixi.js'
// import TextInput from './TextInput'
import { OPTIONS } from 'src/components/PixiStage'
import { ProgramClient } from '@peerbit/program'
import { Post, SpaceDB } from './database/SpaceDB'
import { getSpaceNameFromPath } from './Universe'
import { getIdFromPeer } from './database'
import usePeerList from '../Experiment4/hooks/usePeerList'
import TextInput from '../Experiment4/TextInput'
import AreaSwitch from './AreaSwitch'
import ControlLayer from '../Experiment2/ControlLayer'
// import usePeerList from './hooks/usePeerList'

export default function Space() {
  const navigate = useNextjsNavigate()
  const { peer, loading: loadingPeer, status } = usePeer()
  const [loading, setLoading] = useState(false)
  const space = useRef<SpaceDB>()
  // const [peerCounter, setPeerCounter] = useState<number>(1)
  const [text, setText] = useState('')
  const posts = useRef<Post[]>([])
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  const params = new URLSearchParams(document.location.search)
  const spaceIdParam = params.get('c')
  const peerId = getIdFromPeer(peer)

  useEffect(() => {
    if (!space?.current?.id || space?.current?.closed) {
      return
    }
    space?.current.messages.index.search(new SearchRequest({ query: [] }), {
      remote: { sync: true },
    })
  }, [space?.current?.id, space?.current?.closed])

  useEffect(() => {
    if (space.current || !spaceIdParam || !peer) {
      return
    }
    space.current = undefined
    setLoading(true)
    const name = getSpaceNameFromPath(spaceIdParam)
    peer
      .open(new SpaceDB({ name }), {
        args: { sync: () => true },
        existing: 'reuse',
      })
      .then(async (r) => {
        space.current = r
        const sortPosts = async () => {
          // Sort by time
          const wallTimes = new Map<string, bigint>()
          await Promise.all(
            posts.current.map(async (x) => {
              const message = space.current?.messages.index.index.get(x.id)
              const head = message?.context.head
              const entry = head && (await space.current?.messages.log.log.get(head))
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
        }
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

          sortPosts()
          forceUpdate()
        })

        // Handle missed events by manually retrieving all posts and setting current posts to the ones we find
        posts.current = await r.messages.index.search(new SearchRequest())
        sortPosts()
        forceUpdate()
      })
      .catch((e) => {
        console.error('Failed to open room: ' + e.message)
        // alert('Failed top open room: ' + e.message)
        throw e
      })
      .finally(() => {
        setLoading(false)
      })
  }, [spaceIdParam, peerId])
  console.log(' > posts:', posts)

  const createPost = useCallback(async () => {
    if (!space || !peer) {
      return
    }
    const exportedKeypair = await peer.keychain.exportByKey(peer.identity.publicKey)
    if (!exportedKeypair) {
      return
    }
    space.current?.messages
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
  }, [text, space, peer])

  return (
    <>
      <Text text={`Connection status: ${status}`} style={styles.smallBody} x={180} y={60} />
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
        <SpaceDetails
          space={space.current}
          posts={posts.current}
          text={text}
          setText={setText}
          createPost={createPost}
          peer={peer}
        />
      )}
      <Button
        text="&lsaquo;"
        x={40}
        y={50}
        width={100}
        height={100}
        onPress={navigate('experiment5')}
      />
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

interface SpaceDetailsProps {
  space?: SpaceDB
  posts?: Post[]
  text: string
  peer?: ProgramClient
  setText: (value: SetStateAction<string>) => void
  createPost?: () => void
}
function SpaceDetails(props: SpaceDetailsProps) {
  const { space, posts, text, setText, createPost, peer } = props
  const { peerCount, peerList } = usePeerList(space?.messages)
  const peerId = getIdFromPeer(peer)
  console.log(' > peerCount, peerList:', peerCount, peerList)
  const onTextInputKeyup = useCallback(
    (ev: number) => {
      if (ev === 13) {
        createPost?.()
      }
    },
    [createPost]
  )
  const buttonDisabled = !text
  let trimmedPosts: Post[] = []
  if (posts) {
    const numToRemove = Math.max(0, posts.length - 12)
    trimmedPosts = [...posts]
    trimmedPosts.splice(0, numToRemove)
  }

  if (!space || !posts || !peer) {
    return
  } else {
    return (
      <>
        <AreaSwitch />
        {/* <Text text={`Space ${space.name}`} style={styles.smallBody} x={180} y={60} /> */}
        <Text text={`Peers in space: ${peerCount}`} style={styles.smallBody} x={180} y={100} />
        {trimmedPosts.length > 0 ? (
          trimmedPosts.map((p, ix) => {
            return (
              <Container key={p.id} x={40} y={200 + 60 * ix}>
                <Text
                  text={shortName(p.from.toString())}
                  style={p.from.equals(peer.identity.publicKey) ? selfStyle : styles.smallBody}
                  x={40}
                />
                <Text text={p.message} style={styles.smallBody} x={440} />
              </Container>
            )
          })
        ) : (
          <Text text="No messages found!" style={styles.smallBody} x={40} y={200} />
        )}
        <ControlLayer peerId={peerId} />
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
      </>
    )
  }
}

const shortName = (name: string) => {
  return name.substring(0, 14) + '...' + name.substring(name.length - 3, name.length)
}
