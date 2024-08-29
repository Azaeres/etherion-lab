'use client'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { Texture, TextStyle, BLEND_MODES } from 'pixi.js'
import { Sprite, Text } from '@pixi/react'
import { OPTIONS } from '../../../OPTIONS'
import Curtain from '../../../Curtain'
import Overlay from '../../../Overlay'
import useReactRouterNavigate from '../../../hooks/useReactRouterNavigate'
import boy from 'src/components/scenes/Experiment6/assets/sleeping_boy_kairen.jpg'
import { type Controls } from '../../../components/NarrationTextBox'
import useSoundsControl from '../../../hooks/useSoundsControl'
import useRerenderOnFontsLoaded from 'src/app/experiment6/hooks/useRerenderOnFontsLoaded'
import glowingBoy from './assets/sleeping_boy_kairen_glowing (landscape).jpg'
import Anime, { AnimeWrapperParams } from 'src/app/experiment6/Anime'

export type AnimationValues = {
  glowing: {
    alpha: number
  }
}

const boyTexture = Texture.from(boy.src)
const glowingBoyTexture = Texture.from(glowingBoy.src)

const defaultValues = { glowing: { alpha: 0.0 } } as const
const flightPlan: AnimeWrapperParams<AnimationValues>[] = [
  {
    autoplay: true,
    easing: 'linear',
    duration: 3000,
  },
  {
    targets: ['glowing'],
    alpha: 0.85,
    delay: 6000,
  },
] as const

export default function BookOfZhariel() {
  const fontsLoaded = useRerenderOnFontsLoaded()
  const style = useMemo(() => {
    return new TextStyle({
      fontFamily: 'Whisper, sans-serif',
      fontSize: 112,
      lineHeight: 160,
      // fontWeight: 'bold',
      fill: 0xffffff,
    })
  }, [fontsLoaded])

  const soundsControl = useSoundsControl()
  const navigate = useReactRouterNavigate()
  const controls = useRef<Controls>(null)
  const click = useCallback(() => {
    if (controls.current?.isPlaying) {
      controls.current?.interrupt()
    } else {
      navigate('/experiment6/zhariel/1/1')()
    }
  }, [navigate])
  // const onComplete = useCallback(() => {
  //   console.log('onComplete  :')
  //   soundsControl.fadeOut('wind', 3.0)
  // }, [])
  useEffect(() => {
    soundsControl.fadeOut('wind', 5.0)
  }, [])

  return (
    <>
      <Anime<AnimationValues> defaultValues={defaultValues} flightPlan={flightPlan}>
        {({ glowing }) => (
          <>
            <Sprite
              texture={boyTexture}
              x={OPTIONS.width / 2}
              y={OPTIONS.height / 2}
              anchor={0.5}
              scale={2.6}
            />
            <Sprite
              texture={glowingBoyTexture}
              x={OPTIONS.width / 2}
              y={OPTIONS.height / 2}
              anchor={0.5}
              scale={2.6}
              blendMode={BLEND_MODES.SCREEN} // Experiment with different blend modes here
              alpha={glowing.alpha}
            />
          </>
        )}
      </Anime>
      <Text text={`Seventeen years ago...`} x={600} y={200} anchor={0.5} style={style} />
      <Curtain duration={6000} />
      {/* <NarrationTextBox
        text={`Seventeen years ago.`}
        wordWrapWidth={OPTIONS.width / 2 + 600}
        ref={controls}
        // onComplete={onComplete}
      /> */}
      <Overlay onPointerUp={click} />
    </>
  )
}
