import { createEvent } from 'react-event-hook'
import { Meters } from 'src/utils/physics'

export const { emitPlayerAvatarSpeedUpdate, usePlayerAvatarSpeedUpdateListener } =
  createEvent('playerAvatarSpeedUpdate')<Meters>()
