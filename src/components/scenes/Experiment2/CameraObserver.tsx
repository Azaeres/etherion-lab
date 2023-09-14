import { Pixels, metersFromPx } from 'src/utils/physics'
import { ParallaxCameraContext } from 'pixi-react-parallax'
import { useTick } from '@pixi/react'
import { useCallback, useContext, useState } from 'react'
import { Vec2 } from 'planck'
import { Vec2Meters } from 'src/utils/physics'
import { emitCameraPositionUpdate, emitCameraVelocityUpdate } from './events'

export default function CameraObserver() {
  const camera = useContext(ParallaxCameraContext)
  const [lastCameraPosition, setLastCameraPosition] = useState<Vec2Meters>()
  const update = useCallback(() => {
    if (camera) {
      const cameraPosition = new Vec2(
        metersFromPx(camera.x as Pixels),
        metersFromPx(-camera.y as Pixels)
      ) as Vec2Meters
      // console.log(' > camera.x, cameraPosition.x:', delta, camera.x, cameraPosition.x)
      if (lastCameraPosition) {
        const velocity = cameraPosition.clone() as Vec2Meters
        velocity.sub(lastCameraPosition)
        // console.log('camera  > velocity:', velocity.x)
        velocity.mul(60.0)
        emitCameraVelocityUpdate(velocity)
      }
      setLastCameraPosition(cameraPosition)
      emitCameraPositionUpdate(cameraPosition)
    }
  }, [camera, lastCameraPosition])
  useTick(update)
  return null
}
