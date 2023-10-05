'use client'
import { PeerProvider } from '@peerbit/react'
import Lobby from './Lobby'
import Room from './Room'

export default function Experiment4() {
  console.log('Experiment4 render  :')
  const params = new URLSearchParams(document.location.search)
  const roomIdParam = params.get('c')
  return (
    <PeerProvider network="remote">
      <>{roomIdParam === null ? <Lobby /> : <Room />}</>
    </PeerProvider>
  )
}
