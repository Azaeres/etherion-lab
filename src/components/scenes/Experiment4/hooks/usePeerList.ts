import { usePeer } from '@peerbit/react'
import { PublicSignKey } from '@peerbit/crypto'
import { useCallback, useEffect, useState } from 'react'
import { Program } from '@peerbit/program'

export default function usePeerList(database?: Program) {
  const { peer, loading: loadingPeer } = usePeer()
  const [peers, setPeers] = useState<Record<string, PublicSignKey>>({})

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const join = useCallback((event: any) => {
    const { detail } = event
    console.log('database rcvd join event  > event:', event)
    setPeers((oldValue) => {
      return {
        ...oldValue,
        [detail.hashcode()]: detail,
      }
    })
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leave = useCallback((event: any) => {
    const { detail } = event
    console.log('database rcvd leave event  > event:', event)
    setPeers((oldValue) => {
      const copy = { ...oldValue }
      delete copy[detail.hashcode()]
      return copy
    })
  }, [])

  useEffect(() => {
    database?.events.addEventListener('join', join)
    database?.events.addEventListener('leave', leave)
    return () => {
      database?.events.removeEventListener('join', join)
      database?.events.removeEventListener('leave', leave)
    }
  }, [database?.events, join, leave])

  useEffect(() => {
    if (!loadingPeer) {
      const publicKey = peer?.identity.publicKey
      const defaultPeers = publicKey
        ? {
            [publicKey.hashcode()]: peer?.identity.publicKey,
          }
        : {}
      setPeers(defaultPeers)
    }
  }, [peer, loadingPeer])

  return {
    peerCount: getPeerCount(peers),
    peerList: peers,
  }
}

function getPeerCount(peers: Record<string, unknown>) {
  return Object.keys(peers).length
}
