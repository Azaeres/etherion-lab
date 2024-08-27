'use client'
import React, { useCallback, useMemo } from 'react'
import { Texture, TextStyle } from 'pixi.js'
import { Sprite, Text } from '@pixi/react'
import { OPTIONS } from '../../OPTIONS'
import Curtain from '../../Curtain'
import Overlay from '../../Overlay'
import useReactRouterNavigate from '../../hooks/useReactRouterNavigate'
import boy from 'src/components/scenes/Experiment6/assets/sleeping_boy_kairen.jpg'
import useRerenderOnFontsLoaded from '../../hooks/useRerenderOnFontsLoaded'

const boyTexture = Texture.from(boy.src)

export default function BookOfZhariel() {
  console.log('Zhariel 1:2')
  const fontsLoaded = useRerenderOnFontsLoaded()
  const style = useMemo(() => {
    return new TextStyle({
      fontFamily: 'Oswald, sans-serif',
      fontSize: 56,
      fontWeight: 'bold',
      fill: 0xffffff,
    })
  }, [fontsLoaded])

  const navigate = useReactRouterNavigate()
  const click = useCallback(() => {
    navigate('/experiment6/zhariel/1/1')()
  }, [navigate])
  return (
    <>
      <Sprite
        texture={boyTexture}
        x={OPTIONS.width / 2}
        y={OPTIONS.height / 2}
        anchor={0.5}
        scale={2.6}
      />
      <Text text="Zhariel 1:2" x={400} y={200} anchor={0.5} style={style} />
      <Overlay onPointerUp={click} />
      {/* <Button
        text="&equiv; Menu"
        x={100}
        y={50}
        width={300}
        height={100}
        onPress={nextNavigate('/')}
      /> */}
      <Curtain />
    </>
  )
}
