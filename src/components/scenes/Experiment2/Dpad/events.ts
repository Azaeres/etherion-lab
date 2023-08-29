import { Vec2 } from 'planck'
import { createEvent } from 'react-event-hook'

export const { emitDPadVectorUpdate, useDPadVectorUpdateListener } = createEvent(
  'dPadVectorUpdate'
)<Vec2 | null>()
