'use client'
import React, { useCallback, useRef } from 'react'
import { OPTIONS } from '../../../OPTIONS'
import Overlay from '../../../Overlay'
import useReactRouterNavigate from '../../../hooks/useReactRouterNavigate'
// import boy from 'src/components/scenes/Experiment6/assets/sleeping_boy_kairen.jpg'
// import useRerenderOnFontsLoaded from '../../hooks/useRerenderOnFontsLoaded'
import NarrationTextBox, { type Controls } from '../../../components/NarrationTextBox'

// const boyTexture = Texture.from(boy.src)

export default function BookOfZhariel() {
  // const fontsLoaded = useRerenderOnFontsLoaded()
  // const style = useMemo(() => {
  //   return new TextStyle({
  //     fontFamily: 'Oswald, sans-serif',
  //     fontSize: 56,
  //     fontWeight: 'bold',
  //     fill: 0xffffff,
  //   })
  // }, [fontsLoaded])

  // const soundsControl = useSoundsControl()
  const navigate = useReactRouterNavigate()
  const controls = useRef<Controls>(null)
  const click = useCallback(() => {
    if (controls.current?.isPlaying) {
      controls.current?.interrupt()
    } else {
      navigate('/experiment6/zhariel/1/4')()
    }
  }, [navigate])
  // const onComplete = useCallback(() => {
  //   console.log('onComplete  :')
  //   soundsControl.fadeOut('wind', 3.0)
  // }, [])

  return (
    <>
      {/* <Sprite
        texture={boyTexture}
        x={OPTIONS.width / 2}
        y={OPTIONS.height / 2}
        anchor={0.5}
        scale={2.6}
      /> */}
      {/* <Text text="Zhariel 1:2" x={400} y={200} anchor={0.5} style={style} /> */}
      <NarrationTextBox
        text={`So before I lose you forever, please hear our story...`}
        wordWrapWidth={OPTIONS.width / 2 + 600}
        ref={controls}
        // onComplete={onComplete}
        // animationControls={animationControls}
      />
      <Overlay onPointerUp={click} />
      {/* <Button
        text="&equiv; Menu"
        x={100}
        y={50}
        width={300}
        height={100}
        onPress={nextNavigate('/')}
      /> */}
      {/* <Curtain /> */}
    </>
  )
}
