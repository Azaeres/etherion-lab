'use client'
import { ParallaxCameraProvider, ParallaxLayer } from 'pixi-react-parallax'
import { Texture } from 'pixi.js'
import DebugIndicator from 'src/components/DebugIndicator'
import { metersFromPx, Pixels } from 'src/utils/physics'
import CameraObserver from '../Experiment2/CameraObserver'
import ControlLayer from '../Experiment2/ControlLayer'
import DustSpawnManager from '../Experiment2/Dust/DustSpawnManager'
import PlanckWorldProvider from '../Experiment2/PlanckWorldProvider'
import PrototypeShip from '../Experiment2/PrototypeShip'
import { Sprite } from '@pixi/react-animated'
import stars from '../Experiment1/assets/Stars-full.webp'
// import { PeerProvider } from '@peerbit/react'
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import useNextjsRouter from 'src/app/hooks/useNextjsRouter'
import { Nominal } from 'src/types/Nominal'

import { Peerbit } from 'peerbit'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@dao-xyz/libp2p-noise'
import * as filters from '@libp2p/websockets/filters'
import { mplex } from '@libp2p/mplex'
import { serialize, deserialize } from '@dao-xyz/borsh'
import { base64url } from 'multiformats/bases/base64'
import { Multibase } from 'multiformats'
import { PublicSignKey } from '@peerbit/crypto'
// X25519Keypair
import { Ed25519PublicKey } from '@peerbit/crypto'
import { UniverseObject, UniverseDB } from './database'
import { SearchRequest } from '@peerbit/document'
import { Name, NamesDB } from './names'
import { emitPeerCountUpdate } from './events'

const namesCache = new Map<string, Name>()

export type UniverseKey = Nominal<Ed25519PublicKey, 'UniverseKey'>
export type UniverseId = Nominal<Multibase<'u'>, 'UniverseId'>

export default function Experiment3() {
  const router = useNextjsRouter()
  // console.log(' > router:', router)
  const [peer, setPeer] = useState<Peerbit>()
  const [peerCounter, setPeerCounter] = useState(1)
  // const identitiesInUniverseMap = useRef<Map<string, Ed25519PublicKey>>()
  const namesDb = useRef<NamesDB>()
  const universeDb = useRef<UniverseDB>()
  const [loading, setLoading] = useState(false)
  const [universeId, setUniverseId] = useState<UniverseId>()
  const universeObjectsRef = useRef<UniverseObject[]>([])
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  useEffect(() => {
    ;(async () => {
      const _peer = await Peerbit.create({
        // More info about configs here https://github.com/libp2p/js-libp2p/blob/master/doc/GETTING_STARTED.md#configuring-libp2p
        // More info about configs here https://github.com/libp2p/js-libp2p/blob/master/doc/GETTING_STARTED.md#configuring-libp2p
        // You can provide a preconfigured libp2p client here, or omit it,
        // and it will created for you
        libp2p: {
          start: false,
          addresses: {
            listen: [
              // '/ip4/127.0.0.1/tcp/8002/ws/p2p/12D3KooWT36xY5fiNVs9h7sFNB8ojWQ6K2WUgcqE1iqkSS3YaPEi',
            ],
          },
          connectionGater: {
            denyDialMultiaddr: () => {
              // by default we refuse to dial local addresses from the browser since they
              // are usually sent by remote peers broadcasting undialable multiaddrs but
              // here we are explicitly connecting to a local node so do not deny dialing
              // any discovered address
              return false
            },
          },
          transports: [
            webSockets({
              filter: filters.all,
            }),
          ],
          connectionEncryption: [noise()], // Make connections encrypted
          connectionManager: {
            maxConnections: 100,
            minConnections: 0,
          },
          streamMuxers: [mplex()],
        },
      })
      setPeer(_peer)
    })()
  }, [router])
  useEffect(() => {
    const params = new URLSearchParams(document.location.search)
    const universeParam = params.get('u') as UniverseId
    if (universeParam) {
      console.log('Universe specified > universeParam:', universeParam)
      setUniverseId(universeParam)
    } else if (peer) {
      const universeKey = peer.identity.publicKey as UniverseKey
      console.log('New universe specified  > universeKey:', universeKey)
      setUniverseId(getUniverseIdFromKey(universeKey))
    }
  }, [peer])
  useEffect(() => {
    ;(async () => {
      if (peer) {
        await peer.start()
        console.log('libp2p has started')

        const listenAddrs = peer.getMultiaddrs()
        console.log('libp2p is listening on the following addresses: ', listenAddrs)

        try {
          const replayPeerIdResponse = await fetch('http://localhost:8082/peer/id')
          const relayPeerId = await replayPeerIdResponse.text()
          const address = `/ip4/127.0.0.1/tcp/8002/ws/p2p/${relayPeerId}`
          console.log('Dialing > address:', address)
          await peer.dial(address)
        } catch (error) {
          console.error('Failed to resolve relay addresses. ', error)
        }
      }
    })()
    return () => {
      ;(async () => {
        if (peer) {
          // stop libp2p
          await peer.stop()
          console.log('libp2p has stopped')
        }
      })()
    }
  }, [peer])
  useEffect(() => {
    if (universeId) {
      router.push(`${document.location.pathname}?u=${universeId}`)
    }
  }, [universeId, router])
  useEffect(() => {
    if (!universeDb?.current?.id || universeDb?.current?.closed) {
      return
    }
    universeDb?.current.universeObjects.index.search(new SearchRequest({ query: [] }), {
      remote: { sync: true },
    })
  }, [universeDb?.current?.id, universeDb?.current?.closed, peerCounter])
  const from = peer?.identity.publicKey
  const insertUniverseObject = useCallback(async () => {
    if (!universeDb) {
      return
    }
    if (from) {
      const universeObjectToInsert = new UniverseObject({ x: BigInt(0.0), y: BigInt(0.0), from })
      await universeDb.current?.universeObjects.put(universeObjectToInsert)
      return universeObjectToInsert.id
    }
  }, [from])
  const [avatarObjectId, setAvatarObjectId] = useState<string>()
  const removeUniverseObject = useCallback(async (universeObjectId: string) => {
    if (!universeDb) {
      return
    }
    await universeDb.current?.universeObjects.del(universeObjectId)
  }, [])
  useEffect(() => {
    if (universeDb.current || loading || !universeId || !peer) {
      return
    }
    universeDb.current = undefined
    setLoading(true)
    const key = getKeyFromUniverseId(universeId)
    peer
      .open(new NamesDB(), {
        args: { sync: () => true },
        existing: 'reuse',
      })
      .then(
        // only sync more recent messages?
        async (namesDB) => {
          namesDb.current = namesDB

          const _universeDb = new UniverseDB({ creator: key })

          const updateNames = async (universeObject: UniverseObject) => {
            const index = _universeDb.universeObjects.index.index
            const headLogKey = index?.get(universeObject.id)?.context.head
            if (headLogKey) {
              const head = await _universeDb.universeObjects.log.log.get(headLogKey)
              const publicSignKey = head?.signatures[0]?.publicKey
              if (publicSignKey) {
                const name = await namesDB.getName(publicSignKey)
                if (name) {
                  namesCache.set(publicSignKey.hashcode(), name)
                }
              }
            }
          }

          let updateTimeout: ReturnType<typeof setTimeout> | undefined
          _universeDb.universeObjects.events.addEventListener('change', (event) => {
            event.detail.added?.forEach((universeObject) => {
              const ix = universeObjectsRef.current.findIndex((x) => x.id === universeObject.id)
              if (ix === -1) {
                universeObjectsRef.current.push(universeObject)
              } else {
                universeObjectsRef.current[ix] = universeObject
              }
              updateNames(universeObject)
            })
            event.detail.removed?.forEach((universeObject) => {
              const ix = universeObjectsRef.current.findIndex((x) => x.id === universeObject.id)
              if (ix !== -1) {
                universeObjectsRef.current.splice(ix, 1)
              }
            })

            const wallTimes = new Map<string, bigint>()

            clearTimeout(updateTimeout)
            updateTimeout = setTimeout(async () => {
              const entries = await Promise.all(
                universeObjectsRef.current.map(async (universeObject) => {
                  const indexKey = universeObject.id
                  const index = universeDb.current?.universeObjects.index.index
                  const headLogKey = index?.get(indexKey)?.context.head
                  const entry = headLogKey
                    ? await universeDb.current?.universeObjects.log.log.get(headLogKey)
                    : null
                  return {
                    universeObject,
                    entry,
                  }
                })
              )
              entries.forEach(({ universeObject, entry }) => {
                const wallTime = entry?.meta?.clock?.timestamp?.wallTime
                if (wallTime) {
                  wallTimes.set(universeObject.id, wallTime)
                }
              })

              universeObjectsRef.current.sort((universeObjectA, universeObjectB) => {
                const wallTimeA = wallTimes.get(universeObjectA.id) as bigint
                const wallTimeB = wallTimes.get(universeObjectB.id) as bigint
                return Number(wallTimeA - wallTimeB)
              })

              forceUpdate()
            }, 5)
          })

          console.log('Adding a join listener  > :')
          _universeDb.events.addEventListener('join', (event) => {
            console.log('Peer joined  > event:', event)
            _universeDb.getReady().then((set) => {
              console.log('peer join  > set:', set)
              return setPeerCounter(set.size + 1)
            })
          })

          _universeDb.events.addEventListener('leave', (event) => {
            console.log('Peer left  > event:', event)
            _universeDb.getReady().then((set) => {
              console.log('peer left  > set:', set)
              return setPeerCounter(set.size + 1)
            })
          })

          await peer
            .open(_universeDb, {
              args: { sync: () => true },
              existing: 'reuse',
            })
            .then(async (_universeDb) => {
              universeDb.current = _universeDb
              const avatarObjectId = await insertUniverseObject()
              if (avatarObjectId) {
                setAvatarObjectId(avatarObjectId)
              }
            })
            .catch((error) => {
              console.error('Failed to enter universe: ', error)
              alert('Failed to enter universe: ' + error.message)
              throw error
            })
            .finally(() => {
              setLoading(false)
            })
        }
      )
  }, [avatarObjectId, insertUniverseObject, loading, peer, removeUniverseObject, universeId]) // [params.name, peer?.identity.publicKey.hashcode()]
  useEffect(() => {
    emitPeerCountUpdate(peerCounter)
  }, [peerCounter])
  useEffect(() => {
    return () => {
      console.log('Leaving universe  :')
      if (avatarObjectId) {
        removeUniverseObject(avatarObjectId)
      }
    }
  }, [avatarObjectId, removeUniverseObject])

  // console.log(' > universeObjectsRef.current:', universeObjectsRef.current)
  // console.log(' > peerCounter:', peerCounter)

  const onWorkerMessage = useCallback((event: MessageEvent<unknown>) => {
    console.log('Host received:', event.data)
  }, [])
  const worker = useMemo(() => {
    console.log('Creating new worker...  :')
    // https://webpack.js.org/guides/web-workers/
    return new Worker(new URL('src/example.worker.js', import.meta.url))
  }, [])
  useEffect(() => {
    console.log('Adding event listener...  :')
    worker.onmessage = onWorkerMessage
    // worker.addEventListener('message', onWorkerMessage)
    setTimeout(() => {
      console.log('Posting message to web worker...  :', worker)
      worker.postMessage('from Host')
    }, 2000)
    return () => {
      worker.terminate()
    }
  }, [onWorkerMessage, worker])

  return (
    <>
      <Sprite texture={Texture.from(stars.src)} x={0} y={0} />
      <PlanckWorldProvider gravityY={0}>
        <ParallaxCameraProvider movementDamping={2.0}>
          <ParallaxLayer zIndex={-1250}>
            <DustSpawnManager
              density={20}
              generationDistance={metersFromPx(8000 as Pixels)}
              cullingDistance={metersFromPx(9000 as Pixels)}
            />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-800}>
            <DustSpawnManager
              density={30}
              generationDistance={metersFromPx(6000 as Pixels)}
              cullingDistance={metersFromPx(7000 as Pixels)}
            />
          </ParallaxLayer>
          <ParallaxLayer zIndex={-500}>
            <DustSpawnManager
              density={50}
              generationDistance={metersFromPx(5000 as Pixels)}
              cullingDistance={metersFromPx(6000 as Pixels)}
            />
            <PrototypeShip x={metersFromPx(400 as Pixels)} />
            {/* <Ground /> */}
          </ParallaxLayer>
          <ParallaxLayer zIndex={-300}></ParallaxLayer>
          <ParallaxLayer zIndex={-1}></ParallaxLayer>
          <CameraObserver />
          <DebugIndicator showCameraVelocity />
        </ParallaxCameraProvider>
      </PlanckWorldProvider>
      <ControlLayer />
    </>
  )
}

export function getUniverseIdFromKey(universeKey: UniverseKey) {
  console.log('getUniverseIdFromKey > universeKey:', universeKey)
  return base64url.encode(serialize(universeKey)) as UniverseId
}

export function getKeyFromUniverseId(universeId: UniverseId) {
  console.log('getKeyFromUniverseId  > universeId:', universeId)
  try {
    return deserialize(base64url.decode(universeId), PublicSignKey) as UniverseKey
  } catch (error) {
    throw new Error('Invalid universe ID: ' + universeId)
  }
}
