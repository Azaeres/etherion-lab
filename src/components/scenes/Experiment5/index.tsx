'use client'
import { PeerProvider } from '@peerbit/react'
import Universe from './Universe'
import Space from './Space'

export default function Experiment5() {
  console.log('Experiment5 render  :')
  const params = new URLSearchParams(document.location.search)
  const spaceIdParam = params.get('c')
  return (
    <PeerProvider network="remote">
      <>{spaceIdParam === null ? <Universe /> : <Space />}</>
    </PeerProvider>
  )
}
