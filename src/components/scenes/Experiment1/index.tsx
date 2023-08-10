'use client'
// import { Sprite as PixiSprite } from '@pixi/react'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import Logo from 'src/components/Logo'
import stars from './assets/Stars-full.webp'
import * as PIXI from 'pixi.js'
import { Spring } from 'react-spring'
// import { Texture } from 'pixi.js'
import { Container, Sprite } from '@pixi/react-animated'
import logo from 'src/components/Logo/etherion-logo.png'
import { OPTIONS } from 'src/components/PixiStage'
import { useCallback, useState } from 'react'
// import { Container } from '@pixi/react'

const set = (): AnimatedLogoProps => ({
  x: Math.random() * OPTIONS.width,
  y: Math.random() * OPTIONS.height,
  rotation: Math.random() * 10,
  scale: Math.max(1, Math.random() * 10),
})

export default function Experiment1() {
  const navigate = useNextjsNavigate()
  const [transform, setTransform] = useState<AnimatedLogoProps>(set)
  const click = useCallback(() => {
    setTransform(set)
  }, [])
  return (
    <>
      <Container onpointerup={click} eventMode="static">
        <Sprite texture={PIXI.Texture.from(stars.src)} x={0} y={0} />
        <AnimatedLogo {...transform} />
      </Container>
      <Logo
        x={200}
        y={100}
        onpointerup={navigate('experiment2')}
        cursor="pointer"
        eventMode="static"
      />
    </>
  )
}
interface AnimatedLogoProps {
  x: number
  y: number
  rotation: number
  scale: number
}

function AnimatedLogo(props: AnimatedLogoProps) {
  return (
    <Spring
      to={props}
      config={{ mass: 10, tension: 1000, friction: 100 /*, duration: 4000 */ }}
      loop
    >
      {(props) => <Sprite anchor={0.5} texture={PIXI.Texture.from(logo.src)} {...props} />}
    </Spring>
  )
}
