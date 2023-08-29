import { FederatedPointerEvent } from 'pixi.js'
import { createEvent } from 'react-event-hook'

export const { emitMoveEngage, useMoveEngageListener } =
  createEvent('moveEngage')<FederatedPointerEvent>()

export const { emitMoveDisengage, useMoveDisengageListener } =
  createEvent('moveDisengage')<FederatedPointerEvent>()

export const { emitMoveActivate, useMoveActivateListener } =
  createEvent('moveActivate')<FederatedPointerEvent>()
