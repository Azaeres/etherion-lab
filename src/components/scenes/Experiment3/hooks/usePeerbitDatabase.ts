import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
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
import { PublicSignKey, Ed25519PublicKey } from '@peerbit/crypto'
import AreaDB, { WorldObject } from '../AreaDB'
import { SearchRequest, StringMatch } from '@peerbit/document'
// import NamesDB, { Name } from '../NamesDB'
import { emitPeerCountUpdate } from '../events'
import UniverseDB from '../UniverseDB'
import { DEFAULT_AREA } from '../areas/AsteroidFieldArea'
import { ClassicalUniverseDB, Peer } from '../ClassicalUniverseDB'
import getUUID from 'src/app/utils/getUUID'
import { DirectSub } from '@peerbit/pubsub'

export type CollaborationKey = Nominal<PublicSignKey | Ed25519PublicKey, 'CollaborationKey'>
export type CollaborationId = Nominal<Multibase<'u'>, 'CollaborationId'>
export type PeerId = Nominal<PublicSignKey | Ed25519PublicKey, 'PeerId'>
export type PeerbitInfo = {
  peer?: Peerbit
  peers: Peer[]
  peerId?: PeerId
  loading: boolean
  peerCounter: number
  collaborationId?: CollaborationId
}

// const namesCache = new Map<string, Name>()
export const PeerbitContext = createContext<PeerbitInfo>({
  peer: undefined,
  peers: [],
  peerId: undefined,
  loading: false,
  peerCounter: 0,
  collaborationId: '' as CollaborationId,
})

export default function usePeerbitDatabase(): PeerbitInfo {
  return useContext(PeerbitContext)
}

export function usePeerbitDatabaseSetup(): PeerbitInfo {
  const router = useNextjsRouter()
  const [unmemoizedPeer, setUnmemoizedPeer] = useState<Peerbit>()
  const [universePeerCount, setUniversePeerCount] = useState(1)
  // const identitiesInUniverseMap = useRef<Map<string, Ed25519PublicKey>>()
  // const namesDb = useRef<NamesDB>()
  const universeDb = useRef<UniverseDB>()
  const peersRef = useRef<Peer[]>([])
  const thisPeerRef = useRef<string>()
  const areaDb = useRef<AreaDB>()
  const classicalUniverseDb = useRef<ClassicalUniverseDB>()
  const [connecting, setConnecting] = useState(false)
  const [loading, setLoading] = useState(false)
  // const [collaborationId, setCollaborationId] = useState<CollaborationId>()
  const worldObjectsRef = useRef<WorldObject[]>([])
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  const network: 'local' | 'remote' = 'remote'
  useEffect(() => {
    ;(async () => {
      setConnecting(true)
      const _peer = await Peerbit.create({
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
          connectionEncryption: [noise()], // Make connections encrypted
          connectionManager: {
            maxConnections: 100,
            minConnections: 0,
          },
          streamMuxers: [mplex()],
          ...(network === 'remote'
            ? {
                transports: [
                  webSockets({ filter: filters.wss }),
                  /*             circuitRelayTransport({ discoverRelays: 1 }),
webRTC(), */
                ],
              }
            : {
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
                  // Add websocket impl so we can connect to "unsafe" ws (production only allows wss)
                  webSockets({
                    filter: filters.all,
                  }),
                  /*            circuitRelayTransport({ discoverRelays: 1 }),
webRTC(), */
                ],
              }),

          services: {
            pubsub: (c) =>
              new DirectSub(c, {
                canRelayMessage: true,
                emitSelf: true,
              }),
          },
        },
      })
      setUnmemoizedPeer(_peer)
    })()
  }, [])
  const removePeer = useCallback(async (peerIdToRemove: string) => {
    if (!classicalUniverseDb.current) {
      return
    }
    console.log('Removing peer  > peerIdToRemove:', peerIdToRemove)
    await classicalUniverseDb.current.peers.del(peerIdToRemove)
  }, [])
  // const [avatarObjectId, setAvatarObjectId] = useState<string>()
  // const removeWorldObject = useCallback(async (worldObjectId: string) => {
  //   if (!areaDb) {
  //     return
  //   }
  //   await areaDb.current?.worldObjects.del(worldObjectId)
  // }, [])
  const peer = useMemo(() => {
    return unmemoizedPeer
  }, [unmemoizedPeer])
  const from = peer?.identity.publicKey
  console.log(' > from:', from)
  const insertPeer = useCallback(async () => {
    if (!universeDb.current || !classicalUniverseDb.current) {
      return
    }
    if (from) {
      const peerToInsert = new Peer({ area: DEFAULT_AREA, publicKey: from })
      console.log('Inserting peer  > peerToInsert:', peerToInsert)
      // console.log(' > peersRef.current:', peersRef.current)
      await classicalUniverseDb.current.peers.put(peerToInsert)
      return peerToInsert.id
    }
  }, [from])
  const createOrFindClassicalUniverse = useCallback(
    async (classicalUniverseId: string | null) => {
      if (!universeDb.current) {
        console.warn('Failed to create classical universe db: universe db is not set up.')
        return null
      }
      if (classicalUniverseId) {
        const result = await universeDb.current.classicalUniverses.index.search(
          new SearchRequest({ query: new StringMatch({ key: 'id', value: classicalUniverseId }) })
        )
        console.log('Search for classical universe w id: > result', classicalUniverseId, result)
        console.log(
          ' > universeDb.current.classicalUniverses.index:',
          universeDb.current.classicalUniverses.index
        )
        if (result.length) {
          console.info('Found classical universe with id: ', classicalUniverseId)
          return result[0] || null
        } else {
          console.warn('Failed to find classical universe with id: ', classicalUniverseId)
          return null
        }
      } else {
        const id = getUUID()
        const classicalUniverseToInsert = new ClassicalUniverseDB({
          id,
        })
        await universeDb.current.classicalUniverses.put(classicalUniverseToInsert)
        router?.push(`${document.location.pathname}?c=${id}`)
        return classicalUniverseToInsert
      }
    },
    [router]
  )
  useEffect(() => {
    ;(async () => {
      if (peer) {
        await peer.start()
        console.log('libp2p has started')

        // const listenAddrs = peer.getMultiaddrs()
        // console.log('libp2p is listening on the following addresses: ', listenAddrs)

        try {
          // For the browser to browser to work you need a relay (or use the one that is already available if its online)
          // For more info setting up a relay server, see:
          // https://github.com/dao-xyz/peerbit-examples/blob/fc4a514215afba4154de99736d8fc3c2ba853f0c/packages/name-service/README.md?plain=1#L25C43-L25C43
          // const relayPeerIdResponse = await fetch('https://peerbit-relay.mellifera.io/peer/id')
          // const relayPeerId = await relayPeerIdResponse.text()
          // const address = `/dns/peerbit-relay-p2p.mellifera.io/tcp/443/wss/p2p/${relayPeerId}`
          // // const address = `/ip4/192.168.86.42/tcp/8002/ws/p2p/${relayPeerId}`
          // console.log('Dialing > address:', address)
          // await peer.dial(address)
          // console.log('Relay peer has been dialed.  :')
          await peer['bootstrap']?.()
          setConnecting(false)
        } catch (error) {
          console.error('Failed to resolve relay addresses. ', error)
        }
      }
    })()
    return () => {
      ;(async () => {
        if (peer) {
          // thisPeerRef.current && (await removePeer(thisPeerRef.current))
          // stop libp2p
          await peer.stop()
          console.log('libp2p has stopped')
        }
      })()
    }
  }, [peer, removePeer])
  // useEffect(() => {
  //   const params = new URLSearchParams(document.location.search)
  //   const collaborationParam = params.get('c') as CollaborationId
  //   if (collaborationParam) {
  //     console.log('Collaboration session specified > collaborationParam:', collaborationParam)
  //     setCollaborationId(collaborationParam)
  //   } else if (peer) {
  //     const collaborationKey = peer.identity.publicKey as CollaborationKey
  //     console.log('Collaboration session specified  > collaborationKey:', collaborationKey)
  //     setCollaborationId(getCollaborationIdFromKey(collaborationKey))
  //   }
  // }, [insertClassicalUniverse, peer])
  // useEffect(() => {
  //   if (collaborationId) {
  //     router?.push(`${document.location.pathname}?c=${collaborationId}`)
  //   }
  // }, [collaborationId, router])

  // useEffect(() => {
  //   if (!classicalUniverseDb?.current?.id || classicalUniverseDb?.current?.closed) {
  //     return
  //   }
  //   classicalUniverseDb?.current.areas.index.search(new SearchRequest({ query: [] }), {
  //     remote: { sync: true },
  //   })
  // }, [classicalUniverseDb?.current?.id, classicalUniverseDb?.current?.closed, universePeerCount])

  useEffect(() => {
    if (areaDb.current || loading || connecting || !peer || !from) {
      return
    }
    areaDb.current = undefined
    setLoading(true)

    console.log('Opening new UniverseDB...  :')
    peer
      .open(new UniverseDB(), {
        args: { sync: () => true },
        existing: 'reuse',
      })
      .then(async (_universeDb) => {
        universeDb.current = _universeDb
        const params = new URLSearchParams(document.location.search)
        const collaborationIdParam = params.get('c')

        console.log(
          'open(universeDB).then - Opened UniverseDB  > _universeDB:',
          _universeDb,
          collaborationIdParam
        )

        const _classicalUniverseDb = await (() => {
          return new Promise<ClassicalUniverseDB | null>((resolve) => {
            if (collaborationIdParam) {
              console.log(
                'C param given; Searching for classical universe...  :',
                collaborationIdParam
              )
              _universeDb.classicalUniverses.index
                .search(new SearchRequest(), {
                  local: true,
                  remote: { sync: true },
                })
                .then((results) => {
                  console.log('Search for all classical universes:  > results:', results)
                })
              _universeDb.classicalUniverses.events.addEventListener('change', async (event) => {
                console.log('UniverseDB classicalUniverses change event RCVD  > event:', event)
                console.log(
                  ' > _universeDb.classicalUniverses.index:',
                  _universeDb.classicalUniverses.index.index.get(collaborationIdParam)
                )
                resolve(createOrFindClassicalUniverse(collaborationIdParam))
                // TODO: Wrap in a promise, and resolve here
              })
              _universeDb.events.addEventListener('join', (event) => {
                console.log('UniverseDB join event RCVD > event:', event)
                console.log(
                  ' > _universeDb.classicalUniverses.index:',
                  _universeDb.classicalUniverses.index.index.get(collaborationIdParam)
                )
              })
            } else {
              console.log('No c Param given; Creating new classical universe...  :')
              resolve(createOrFindClassicalUniverse(null))
              // TODO: Wrap in a promise, and resolve here
            }
          })
        })()
        // TODO: When we have a promise, log here on resolution.
        console.log(' > _classicalUniverseDb:', _classicalUniverseDb)
        if (_classicalUniverseDb) {
          classicalUniverseDb.current = _classicalUniverseDb
        }
        return {
          _classicalUniverseDb,
        }
        // setTimeout(() => {
        //   console.log('Calling createOrFindClassicalUniverse()...  :')
        //   const _classicalUniverseDb = createOrFindClassicalUniverse(collaborationIdParam)
        // }, 4000)
      })
      .then(async ({ _classicalUniverseDb }) => {
        if (!_classicalUniverseDb) {
          return
        }
        console.log('Opening classical universe DB...  :')
        peer
          .open(_classicalUniverseDb, {
            args: { sync: () => true },
            existing: 'reuse',
          })
          .then(async (_classicalUniverseDb) => {
            console.log('open.then(_classicalUniverseDb) - Opened ClassicalUniverseDB.  :')
            classicalUniverseDb.current = _classicalUniverseDb
            console.log(' > _classicalUniverseDb.peers.index:', _classicalUniverseDb.peers.index)
            const results = await _classicalUniverseDb.peers.index.search(new SearchRequest(), {
              local: true,
              remote: { sync: true },
            })
            console.log('Searching for all peers:  > results:', results)
            addPeerToLocalCollection(results, true)
            _classicalUniverseDb.peers.events.addEventListener('change', (event) => {
              console.log('peer on change rcvd  > event:', event)
              const addChanged = event.detail.added.length
                ? addPeerToLocalCollection(event.detail.added)
                : false
              const removeChanged = event.detail.removed.length
                ? removePeerFromLocalCollection(event.detail.removed)
                : false
              if (addChanged || removeChanged) {
                sortLocalCollection()
              }
            })

            _classicalUniverseDb.getReady().then(async (set) => {
              console.log('classical universe getReady().then()  > set:', set)
              // await insertPeer()
              return setUniversePeerCount(set.size + 1)
            })

            console.log('Setting join listener on classical universe  :', _classicalUniverseDb.id)
            _classicalUniverseDb.events.addEventListener('join', (event) => {
              console.log(
                'Join triggered  event:, _classicalUniverseDb.id',
                event,
                _classicalUniverseDb.id
              )
              _classicalUniverseDb.getReady().then(async (set) => {
                console.log('Joined  > set:', set)
                // await insertPeer()
                return setUniversePeerCount(set.size + 1)
              })
            })

            _classicalUniverseDb.events.addEventListener('leave', (event) => {
              console.log(
                'Leave triggered on classical universe  event:, _classicalUniverseDb.id',
                event,
                _classicalUniverseDb.id
              )
              _classicalUniverseDb.getReady().then(async (set) => {
                console.log('Leave  > set:', set)
                // await removePeer(event.detail.hashcode())
                return setUniversePeerCount(set.size + 1)
              })
            })

            console.log('[placeholder] Insert peer here...  :')
            thisPeerRef.current = await insertPeer()
          })
          .catch((error) => {
            console.error('Failed to open ClassicalUniverseDB: ', error)
            // alert('Failed to enter universe: ' + error.message)
            throw new Error('Failed to open ClassicalUniverseDB: ', error)
          })
          .finally(() => {
            console.log('Finally - Opened ClassicalUniverseDB  :', classicalUniverseDb.current)
            setLoading(false)
          })
      })
      .catch((error) => {
        console.error('Failed to open UniverseDB: ', error)
        // alert('Failed to enter universe: ' + error.message)
        throw new Error('Failed to open UniverseDB: ', error)
      })
      .finally(() => {
        console.log('Finally - Opened UniverseDB  :', universeDb.current)
        // setLoading(false)
      })

    // const collaborationId =
    //   collaborationIdParam || getCollaborationIdFromKey(from as CollaborationKey)
    // const _classicalUniverseDb = createOrFindClassicalUniverse(collaborationId)

    const addPeerToLocalCollection = (peersToAdd: Peer[], reset: boolean = false) => {
      if (reset) {
        peersRef.current = []
      }
      const peersRefCopy = [...peersRef.current]
      peersToAdd.forEach((peerToAdd) => {
        console.log('foreach  > peerToAdd:', peerToAdd)
        const index = peersRefCopy.findIndex((peer) => peer.id === peerToAdd.id)
        const found = index !== -1
        console.log(' > found:', found)
        if (found) {
          console.log(
            'Found! Replacing peer at  > index, peersRefCopy[index]:',
            index,
            peersRefCopy[index]
          )
          peersRefCopy[index] = peerToAdd
        } else {
          console.log('NOT found! Appending  > peerToAdd:', peerToAdd)
          peersRefCopy.push(peerToAdd)
        }
      })
      console.log('Before add  > peersRef.current:', [...peersRef.current])
      peersRef.current = peersRefCopy
      console.log('After add  > peersRef.current:', [...peersRef.current])

      const changed = !!peersToAdd.length
      return changed
    }

    const removePeerFromLocalCollection = (peersToRemove: Peer[]) => {
      const peersRefCopy = [...peersRef.current]
      peersToRemove.forEach((removedPeer) => {
        console.log('foreach  > removedPeer:', removedPeer)
        const index = peersRefCopy.findIndex((peer) => peer.id === removedPeer.id)
        const found = index !== -1
        console.log(' > found:', found)
        if (found) {
          console.log('Found! splicing at > index:', index)
          peersRefCopy.splice(index, 1)
        }
      })
      console.log('Before remove  > peersRef.current:', [...peersRef.current])
      peersRef.current = peersRefCopy
      console.log('After remove  > peersRef.current:', [...peersRef.current])

      const changed = !!peersToRemove.length
      return changed
    }

    let updateTimeout: NodeJS.Timeout | undefined
    const sortLocalCollection = () => {
      const peersRefCopy = [...peersRef.current]
      const wallTimes = new Map<string, bigint>()

      clearTimeout(updateTimeout)
      updateTimeout = setTimeout(async () => {
        const entries = await Promise.all(
          peersRefCopy.map(async (peer) => {
            const index = classicalUniverseDb.current?.peers.index.index
            const headLogKey = index?.get(peer.id)?.context.head
            const entry = headLogKey
              ? await classicalUniverseDb.current?.peers.log.log.get(headLogKey)
              : null
            return {
              peer,
              entry,
            }
          })
        )
        entries.forEach(({ peer, entry }) => {
          const wallTime = entry?.meta?.clock?.timestamp?.wallTime
          if (wallTime) {
            wallTimes.set(peer.id, wallTime)
          }
        })

        peersRefCopy.sort((peerA, peerB) => {
          const wallTimeA = wallTimes.get(peerA.id) as bigint
          const wallTimeB = wallTimes.get(peerB.id) as bigint
          return Number(wallTimeA - wallTimeB)
        })
        console.log('Before sort  > peersRef.current:', [...peersRef.current])
        peersRef.current = peersRefCopy
        console.log('After sort  > peersRef.current:', [...peersRef.current])

        forceUpdate()
      }, 5)
    }

    // peer
    //   .open(_classicalUniverseDb, {
    //     args: { sync: () => true },
    //     existing: 'reuse',
    //   })
    //   .then(async (_classicalUniverseDb) => {
    //     console.log('Opened ClassicalUniverseDB.  :')
    //     classicalUniverseDb.current = _classicalUniverseDb

    //     console.log(' > _classicalUniverseDb.peers.index:', _classicalUniverseDb.peers.index)
    //     const results = await _classicalUniverseDb.peers.index.search(new SearchRequest(), {
    //       local: true,
    //       remote: { sync: true },
    //     })
    //     console.log('Search  > results:', results)
    //     addPeerToLocalCollection(results, true)

    //     _classicalUniverseDb.peers.events.addEventListener('change', (event) => {
    //       console.log('peer on change rcvd  > event:', event)
    //       const addChanged = event.detail.added.length
    //         ? addPeerToLocalCollection(event.detail.added)
    //         : false

    //       const removeChanged = event.detail.removed.length
    //         ? removePeerFromLocalCollection(event.detail.removed)
    //         : false

    //       if (addChanged || removeChanged) {
    //         sortLocalCollection()
    //       }
    //     })

    // console.log('Setting join listener  :', _classicalUniverseDb.id)
    // _classicalUniverseDb.events.addEventListener('join', (event) => {
    //   console.log(
    //     'Join triggered  event:, _classicalUniverseDb.id',
    //     event,
    //     _classicalUniverseDb.id
    //   )
    //   _classicalUniverseDb.getReady().then(async (set) => {
    //     console.log('Joined  > set:', set)
    //     // await insertPeer()
    //     return setUniversePeerCount(set.size + 1)
    //   })
    // })

    // _classicalUniverseDb.events.addEventListener('leave', (event) => {
    //   console.log(
    //     'Leave triggered  event:, _classicalUniverseDb.id',
    //     event,
    //     _classicalUniverseDb.id
    //   )
    //   _classicalUniverseDb.getReady().then(async (set) => {
    //     console.log('Leave  > set:', set)
    //     // await removePeer(event.detail.hashcode())
    //     return setUniversePeerCount(set.size + 1)
    //   })
    // })

    // thisPeerRef.current = await insertPeer()

    // classicalUniverseRef.current = await insertClassicalUniverse(collaborationKey)

    // Do this block when the player moves into an area:
    // https://github.com/dao-xyz/peerbit-examples/blob/0c1fc2ae211195c0669c30ee232d8960ae1ff9cd/packages/many-chat-rooms/frontend/src/Room.tsx#L94C22-L94C22
    //             from && new AreaDB({ areaId: 'NebulaArea', creator: from })
    // Create a `movePeerIntoArea(areaId)` function, and return it with the peerbit info.
    // Have the Avatar use that function when it traverses into a new area.
    // The function calls `peer.open()` on a new AreaDb({areaId, creator: from})

    // .then(async ({ namesDB }) => {
    //   const key = getKeyFromCollaborationId(collaborationId)
    //   const _universeDB = new UniverseDB({ creator: key })

    //   console.log('Adding join listener to universeDB  :')
    //   _universeDB.events.addEventListener('join', () => {
    //     console.log('universe join  :')
    //     _universeDB.getReady().then((set) => {
    //       return setUniversePeerCount(set.size + 1)
    //     })
    //   })

    //   console.log('Adding leave listener to universeDB  :')
    //   _universeDB.events.addEventListener('leave', () => {
    //     console.log('universe leave  :')
    //     _universeDB.getReady().then((set) => {
    //       return setUniversePeerCount(set.size + 1)
    //     })
    //   })

    //   await peer
    //     .open(_universeDB, { args: { sync: () => true }, existing: 'reuse' })
    //     .then(async (_universeDb) => {
    //       universeDb.current = _universeDb
    //     })
    //     .catch((error) => {
    //       console.error('Failed to enter universe: ', error)
    //       alert('Failed to enter universe: ' + error.message)
    //       throw error
    //     })
    //     .finally(() => {
    //       console.log('Opened UniverseDB  :', universeDb.current)
    //       setLoading(false)
    //     })

    //   return {
    //     namesDB,
    //     universeDB: _universeDB,
    //     // addAreaDBToUniverse,
    //   }
    // })

    // .then(
    //   // only sync more recent messages?
    //   async ({ namesDB, universeDB }) => {
    //     const _areaDb = new AreaDB({ creator: key })

    //     // TODO: Wire up area sync.

    //     const updateNames = async (worldObject: WorldObject) => {
    //       const index = _areaDb.worldObjects.index.index
    //       const headLogKey = index?.get(worldObject.id)?.context.head
    //       if (headLogKey) {
    //         const head = await _areaDb.worldObjects.log.log.get(headLogKey)
    //         const publicSignKey = head?.signatures[0]?.publicKey
    //         if (publicSignKey) {
    //           const name = await namesDB.getName(publicSignKey)
    //           if (name) {
    //             console.log('Updating  > name:', name)
    //             namesCache.set(publicSignKey.hashcode(), name)
    //           }
    //         }
    //       }
    //     }

    //     let updateTimeout: ReturnType<typeof setTimeout> | undefined
    //     _areaDb.worldObjects.events.addEventListener('change', (event) => {
    //       event.detail.added?.forEach((worldObject) => {
    //         const ix = worldObjectsRef.current.findIndex((x) => x.id === worldObject.id)
    //         if (ix === -1) {
    //           worldObjectsRef.current.push(worldObject)
    //         } else {
    //           worldObjectsRef.current[ix] = worldObject
    //         }
    //         updateNames(worldObject)
    //       })
    //       event.detail.removed?.forEach((worldObject) => {
    //         const ix = worldObjectsRef.current.findIndex((x) => x.id === worldObject.id)
    //         if (ix !== -1) {
    //           worldObjectsRef.current.splice(ix, 1)
    //         }
    //       })

    //       const wallTimes = new Map<string, bigint>()

    //       clearTimeout(updateTimeout)
    //       updateTimeout = setTimeout(async () => {
    //         const entries = await Promise.all(
    //           worldObjectsRef.current.map(async (worldObject) => {
    //             const indexKey = worldObject.id
    //             const index = areaDb.current?.worldObjects.index.index
    //             const headLogKey = index?.get(indexKey)?.context.head
    //             const entry = headLogKey
    //               ? await areaDb.current?.worldObjects.log.log.get(headLogKey)
    //               : null
    //             return {
    //               worldObject,
    //               entry,
    //             }
    //           })
    //         )
    //         entries.forEach(({ worldObject, entry }) => {
    //           const wallTime = entry?.meta?.clock?.timestamp?.wallTime
    //           if (wallTime) {
    //             wallTimes.set(worldObject.id, wallTime)
    //           }
    //         })

    //         worldObjectsRef.current.sort((worldObjectA, worldObjectB) => {
    //           const wallTimeA = wallTimes.get(worldObjectA.id) as bigint
    //           const wallTimeB = wallTimes.get(worldObjectB.id) as bigint
    //           return Number(wallTimeA - wallTimeB)
    //         })

    //         forceUpdate()
    //       }, 5)
    //     })

    //     console.log('Adding a join listener  > :')
    //     _areaDb.events.addEventListener('join', (event) => {
    //       console.log('Peer joined  > event:', event)
    //       _areaDb.getReady().then((set) => {
    //         console.log('peer join  > set:', set)
    //         return setUniversePeerCount(set.size + 1)
    //       })
    //     })

    //     _areaDb.events.addEventListener('leave', (event) => {
    //       console.log('Peer left  > event:', event)
    //       _areaDb.getReady().then((set) => {
    //         console.log('peer left  > set:', set)
    //         return setUniversePeerCount(set.size + 1)
    //       })
    //     })

    //     await peer
    //       .open(_areaDb, {
    //         args: { sync: () => true },
    //         existing: 'reuse',
    //       })
    //       .then(async (_areaDb) => {
    //         areaDb.current = _areaDb
    //         // const avatarObjectId = await insertUniverseObject()
    //         // if (avatarObjectId) {
    //         //   setAvatarObjectId(avatarObjectId)
    //         // }
    //       })
    //       .catch((error) => {
    //         console.error('Failed to enter area: ', error)
    //         alert('Failed to enter area: ' + error.message)
    //         throw error
    //       })
    //       .finally(() => {
    //         setLoading(false)
    //       })
    //   }
    // )
    // return async () => {
    //   await peer.stop()
    // }
  }, [createOrFindClassicalUniverse, from, insertPeer, peer, connecting]) // [params.name, peer?.identity.publicKey.hashcode()]
  useEffect(() => {
    console.log('Peer count changed  > peers.current:', peersRef.current)
    emitPeerCountUpdate(universePeerCount)
  }, [universePeerCount])
  useEffect(() => {
    return () => {
      console.log('Leaving area  :')
      // if (avatarObjectId) {
      //   removeUniverseObject(avatarObjectId)
      // }
    }
  }, [])
  // useEffect(
  //   function PeerbitCleanup() {
  //     const cleanup = async () => {
  //       thisPeerRef.current && (await removePeer(thisPeerRef.current))
  //       // await peer?.stop()
  //     }
  //     return () => {
  //       cleanup()
  //     }
  //   },
  //   [peer, removePeer]
  // )

  console.log(' > worldObjectsRef.current:', worldObjectsRef.current)
  console.log(' > areaDb.current?.creator:', areaDb.current?.creator)
  console.log(' > peer?.identity.publicKey:', peer?.identity.publicKey)
  console.log(' > peers:', [...peersRef.current])
  // console.log(' > peerCounter:', peerCounter)
  return {
    peer,
    peers: [...peersRef.current],
    peerId: peer?.identity.publicKey as PeerId,
    loading,
    peerCounter: universePeerCount,
  }
}

export function getCollaborationIdFromKey(collaborationKey: CollaborationKey) {
  return base64url.encode(serialize(collaborationKey)) as CollaborationId
}

export function getKeyFromCollaborationId(collaborationId: CollaborationId) {
  try {
    return deserialize(base64url.decode(collaborationId), PublicSignKey) as CollaborationKey
  } catch (error) {
    throw new Error('Invalid collaboration ID: ' + collaborationId)
  }
}

// function arrayBuffersAreEqual(a: Uint8Array, b: Uint8Array) {
//   if (a.byteLength !== b.byteLength) return false
//   return a.every((val, i) => val == b[i])
// }
