import { Sprite } from '@pixi/react'
import logo from './etherion-logo.png'
import { Texture } from 'pixi.js'
import { ComponentProps } from 'react'

interface LogoProps extends ComponentProps<typeof Sprite> {}

export default function Logo(props: LogoProps) {
  return <Sprite texture={Texture.from(logo.src)} x={40} y={50} {...props} />
}
