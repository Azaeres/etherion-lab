import { InteractionEvents, Sprite, _ReactPixi } from '@pixi/react'
import logo from './etherion-logo.png'
import * as PIXI from 'pixi.js'
import { JSX, Ref, ReactNode } from 'react'

export default function Logo(
  props: JSX.IntrinsicAttributes &
    Partial<
      Omit<
        PIXI.Sprite,
        _ReactPixi.P | _ReactPixi.ReadonlyKeys<PIXI.Sprite> | keyof _ReactPixi.WithSource
      > &
        _ReactPixi.WithPointLike<_ReactPixi.P>
    > &
    _ReactPixi.WithSource &
    InteractionEvents & { ref?: Ref<PIXI.Sprite> | undefined } & { children?: ReactNode }
) {
  return <Sprite texture={PIXI.Texture.from(logo.src)} x={40} y={50} {...props} />
}
