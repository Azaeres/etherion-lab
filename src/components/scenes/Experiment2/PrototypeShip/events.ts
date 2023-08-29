import { createEvent } from 'react-event-hook'

export const { emitPlayerAvatarSpeedUpdate, usePlayerAvatarSpeedUpdateListener } =
  createEvent('playerAvatarSpeedUpdate')<number>()
