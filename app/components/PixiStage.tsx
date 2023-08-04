import { Sprite, Stage } from 'react-pixi-fiber/index.js'
import logo from 'app/assets/images/etherion-logo.png'
import * as PIXI from 'pixi.js'

export const OPTIONS = {
  width: 2592,
  height: 1080,
  antialias: true,
  hello: true,
  backgroundColor: 0x10bb99,
}

export default function PixiStage() {
  if (typeof window !== 'undefined') {
    return (
      <Stage options={OPTIONS}>
        <Logo />
      </Stage>
    )
  }
  return null
}

function Logo() {
  return <Sprite texture={PIXI.Texture.from(logo.src)} x={40} y={50} />
}
