import { useEffect, useRef } from 'react'
import { useParallaxCameraTarget } from '.'
import { DisplayObject } from 'pixi.js'

export default function useParallaxCameraRef(): [
  React.MutableRefObject<unknown>,
  (displayObject?: DisplayObject | null) => void,
] {
  const setCameraTarget = useParallaxCameraTarget()
  const playerRef = useRef<unknown>()
  const setPlayerRef = (displayObject?: DisplayObject | null) => {
    if (!playerRef.current) {
      playerRef.current = displayObject
      setCameraTarget(displayObject)
    }
  }

  useEffect(() => {
    return () => {
      // Release the camera target upon cleanup.
      playerRef.current = undefined
      setCameraTarget(undefined)
    }
  }, [setCameraTarget])
  return [playerRef, setPlayerRef]
}
