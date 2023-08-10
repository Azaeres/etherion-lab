import React, { useEffect, useCallback, useMemo, createContext, useContext, useState } from 'react'
import { Container, PixiComponent, useApp, useTick } from '@pixi/react'
import * as PIXI from 'pixi.js'
import { ParallaxCamera } from './parallax-camera'
import ParallaxLayerContainer from './parallax-camera/ParallaxLayer'

export const ParallaxCameraContext = createContext<ParallaxCamera | null>(null)

export function useParallaxCameraTarget(camera?: ParallaxCamera) {
  const contextCamera = useContext(ParallaxCameraContext)
  const _camera = contextCamera || camera
  const [cameraTarget, setCameraTarget] = useState<PIXI.DisplayObject>()
  useEffect(() => {
    if (_camera) {
      cameraTarget && _camera.setTarget(cameraTarget)
    }
  }, [_camera, cameraTarget])

  const _setCameraTarget = useCallback(
    (newTarget?: PIXI.DisplayObject | null) => {
      _camera?.setTarget(newTarget === null ? undefined : newTarget)
      setCameraTarget(newTarget === null ? undefined : newTarget)
    },
    [_camera]
  )

  return _setCameraTarget
}

type ParallaxCameraProps = {
  children?: React.ReactNode
}

export function ParallaxCameraProvider(props: ParallaxCameraProps) {
  const { view, renderer, stage } = useApp()
  const [baseContainer, setBaseContainer] = useState<PIXI.Container<PIXI.DisplayObject> | null>()

  const camera = useMemo(() => {
    if (baseContainer) {
      return new ParallaxCamera(view, renderer, baseContainer, 300, 10)
    } else {
      return null
    }
  }, [view, renderer, baseContainer])

  useEffect(() => {
    baseContainer && stage.addChild(baseContainer)
    return () => {
      baseContainer && stage.removeChild(baseContainer)
    }
  }, [stage, camera, baseContainer])

  const animate = useCallback(() => {
    try {
      camera?.update()
    } catch (error) {
      console.error('Error updating camera: ', error)
    }
  }, [camera])
  useTick(animate)

  return (
    <Container ref={setBaseContainer} {...props}>
      <ParallaxCameraContext.Provider value={camera}>
        {props.children}
      </ParallaxCameraContext.Provider>
    </Container>
  )
}

type ParallaxLayerProps = {
  zIndex?: number
  children?: React.ReactNode
}

const CustomParallaxLayer = PixiComponent('ParallaxLayer', {
  create: (props: ParallaxLayerProps) => {
    return new ParallaxLayerContainer(props.zIndex)
  },
})

export function ParallaxLayer(props: ParallaxLayerProps) {
  const layerRef = React.useRef<ParallaxLayerContainer>(null)
  const camera = useContext(ParallaxCameraContext)
  useEffect(() => {
    const layer = layerRef.current
    if (layer) {
      if (props.zIndex !== undefined) {
        layer.pz = props.zIndex
      }
      camera?.addLayer(layer)
    }
    return () => {
      layer && camera?.removeLayer(layer)
    }
  }, [camera, props.zIndex, layerRef])
  return <CustomParallaxLayer ref={layerRef} {...props} />
}
