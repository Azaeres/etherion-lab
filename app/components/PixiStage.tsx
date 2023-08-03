import { Sprite, Stage } from 'react-pixi-fiber/index.js'
import logo from 'app/assets/images/etherion-logo.png'
import * as PIXI from 'pixi.js'

export default function PixiStage() {
  if (typeof window !== 'undefined') {
    return (
      <Stage options={{ backgroundColor: 0x10bb99, height: 600, width: 800 }}>
        <Logo />
      </Stage>
    )
  }
  return null
}

function Logo() {
  return <Sprite texture={PIXI.Texture.from(logo.src)} x={40} y={50} />
}
