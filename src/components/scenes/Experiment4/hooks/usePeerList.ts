import { usePeer } from '@peerbit/react'
import { PublicSignKey } from '@peerbit/crypto'
import { useCallback, useEffect, useReducer, useRef } from 'react'
import { Program } from '@peerbit/program'

export default function usePeerList(database?: Program) {
  const { peer } = usePeer()
  const peersRef = useRef<Record<string, PublicSignKey | undefined>>({})
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  console.log('usePeerList()  :')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const join = useCallback((event: any) => {
    const { detail } = event
    console.log('database rcvd join event  > event:', event)
    const oldValue = peersRef.current
    const newValue = {
      ...oldValue,
      [detail.hashcode()]: detail,
    }
    console.log('join - Setting peers... > newValue:', newValue)
    peersRef.current = newValue
    forceUpdate()
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leave = useCallback((event: any) => {
    const { detail } = event
    console.log('database rcvd leave event  > event:', event)
    const oldValue = peersRef.current
    const copy = { ...oldValue }
    delete copy[detail.hashcode()]
    console.log('leave - Setting peers... > copy:', copy)
    peersRef.current = copy
    forceUpdate()
  }, [])

  useEffect(() => {
    database?.getReady().then((set) => {
      const peersCopy = { ...peersRef.current }
      set.forEach((hashcode) => {
        const found = peersCopy[hashcode]
        if (!found) {
          // @ts-expect-error // `peerKeyHashToPublicKey` is currently not typed, so we'll suppress the error for now.
          const publicKey = peer?.services.pubsub.peerKeyHashToPublicKey?.get(hashcode)
          peersCopy[hashcode] = publicKey
        }
      })
      console.log('initial - Setting peers... > peersCopy:', peersCopy)
      peersRef.current = peersCopy
      forceUpdate()
    })
    console.log('Attaching listeners to  > database:', database)
    database?.events.addEventListener('join', join)
    database?.events.addEventListener('leave', leave)
    return () => {
      console.log('Detaching listeners to  > database:', database)
      database?.events.removeEventListener('join', join)
      database?.events.removeEventListener('leave', leave)
    }
  }, [database, join, leave])

  useEffect(() => {
    const publicKey = peer?.identity.publicKey
    const defaultPeers = publicKey
      ? {
          [publicKey.hashcode()]: peer?.identity.publicKey,
        }
      : {}
    console.log('self identity - Setting peers... > defaultPeers:', defaultPeers)
    peersRef.current = defaultPeers
    forceUpdate()
  }, [peer, peer?.identity.publicKey])

  return {
    peerCount: getPeerCount(peersRef.current),
    peerList: peersRef.current,
  }
}

function getPeerCount(peers: Record<string, unknown>) {
  return Object.keys(peers).length
}
