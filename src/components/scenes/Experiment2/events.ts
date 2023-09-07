import { createEvent } from 'react-event-hook'
import { Vec2Meters } from 'src/utils/physics'

export const { emitCameraPositionUpdate, useCameraPositionUpdateListener } =
  createEvent('cameraPositionUpdate')<Vec2Meters>()

export const { emitCameraVelocityUpdate, useCameraVelocityUpdateListener } =
  createEvent('cameraVelocityUpdate')<Vec2Meters>()
