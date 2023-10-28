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
  const [lastCameraVelocity, setLastCameraVelocity] = useState<Vec2Meters>()
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

        if (!lastCameraVelocity || !areVectorsEqual(velocity, lastCameraVelocity)) {
          // console.log('emitting new camera  > velocity:', velocity)
          // console.log(' > lastCameraVelocity:', lastCameraVelocity)
          setLastCameraVelocity(velocity)
          emitCameraVelocityUpdate(velocity)
        }
      }
      if (!lastCameraPosition || !areVectorsEqual(cameraPosition, lastCameraPosition)) {
        // console.log('emitting new  > cameraPosition:', cameraPosition)
        setLastCameraPosition(cameraPosition)
        emitCameraPositionUpdate(cameraPosition)
      }
    }
  }, [
    camera,
    lastCameraPosition?.x,
    lastCameraPosition?.y,
    lastCameraVelocity?.x,
    lastCameraVelocity?.y,
  ])
  useTick(update)
  return null
}

const TOLERANCE = 0.001

function areVectorsEqual(vec1: Vec2, vec2: Vec2) {
  const isXWithinTol = areValuesWithinTolerance(vec1.x, vec2.x)
  const isYWithinTol = areValuesWithinTolerance(vec1.y, vec2.y)
  // console.log('areVectorsEqual  > isXWithinTol, isYWithinTol:', isXWithinTol, isYWithinTol)
  return isXWithinTol && isYWithinTol
}

function areValuesWithinTolerance(val1: number, val2: number) {
  return Math.abs(val1 - val2) <= TOLERANCE
}
