import { FederatedPointerEvent } from 'pixi.js'
import { createEvent } from 'react-event-hook'

export const { emitMoveEngage, useMoveEngageListener } =
  createEvent('moveEngage')<FederatedPointerEvent>()

export const { emitMoveDisengage, useMoveDisengageListener } =
  createEvent('moveDisengage')<FederatedPointerEvent>()

export const { emitMoveActivate, useMoveActivateListener } =
  createEvent('moveActivate')<FederatedPointerEvent>()

export const { emitAttackEngage, useAttackEngageListener } =
  createEvent('attackEngage')<FederatedPointerEvent>()

export const { emitAttackDisengage, useAttackDisengageListener } =
  createEvent('attackDisengage')<FederatedPointerEvent>()

export const { emitAttackActivate, useAttackActivateListener } =
  createEvent('attackActivate')<FederatedPointerEvent>()
