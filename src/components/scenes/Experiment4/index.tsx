'use client'
import { PeerProvider } from '@peerbit/react'

export default function Experiment4() {
  console.log('Experiment4 render  :')
  return (
    <PeerProvider network="remote">
      <></>
    </PeerProvider>
  )
}
