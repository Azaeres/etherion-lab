import { createEvent } from 'react-event-hook'
import { Meters } from 'src/utils/physics'
import { AreaId } from '../../AreaSwitch/list'

export const { emitPlayerAvatarSpeedUpdate, usePlayerAvatarSpeedUpdateListener } =
  createEvent('playerAvatarSpeedUpdate')<Meters>()

export const { emitAvatarCurrentAreaUpdate, useAvatarCurrentAreaUpdateListener } =
  createEvent('avatarCurrentAreaUpdate')<AreaId>()
