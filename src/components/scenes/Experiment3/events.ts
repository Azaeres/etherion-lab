import { createEvent } from 'react-event-hook'

export const { emitPeerCountUpdate, usePeerCountUpdateListener } =
  createEvent('peerCountUpdate')<number>()
