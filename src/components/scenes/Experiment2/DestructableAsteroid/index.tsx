import { Texture, Spritesheet } from 'pixi.js'
import { ComponentProps, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import asteroidsTexture from '../assets/asteroids/asteroids.webp'
import asteroidsJson from '../assets/asteroids/asteroids.json'
import { AnimatedSprite, Sprite } from '@pixi/react'
import { OPTIONS } from 'src/components/PixiStage'
import PlanckBody from '../PlanckBody'
import { Box, Vec2, Body } from 'planck'
import { metersFromPx } from 'src/utils/physics'

export interface DestructableAsteroidProps extends ComponentProps<typeof Sprite> {}

const getRandomPosition = () => {
  return {
    x: Math.random() * OPTIONS.width,
    y: Math.random() * OPTIONS.height,
    rotation: Math.random() * 2 * Math.PI,
    initialFrame: Math.floor(Math.random() * 64),
    scale: Math.random() * 6.6 + 0.6,
  } as const
}

export default function DestructableAsteroid() {
  const initialPosition = useMemo(getRandomPosition, [])
  const fixtures = useMemo(() => {
    return [
      {
        shape: Box(0.3 * initialPosition.scale, 0.3 * initialPosition.scale),
        density: 0.3 * initialPosition.scale,
        friction: 0.3,
      },
    ]
  }, [initialPosition.scale])
  const [textures, setTextures] = useState<Texture[] | null>(null)
  useEffect(() => {
    ;(async () => {
      const sheet = new Spritesheet(Texture.from(asteroidsTexture.src), asteroidsJson)
      await sheet.parse()
      // console.log('Spritesheet ready to use!', sheet)
      setTextures(Object.values(sheet.textures))
    })()
  }, [])
  const bodyRef = useRef<Body>()
  const callback = useCallback(
    (body: Body) => {
      bodyRef.current = body
    },
    [bodyRef]
  )
  return (
    <>
      <PlanckBody
        bodyDef={{
          type: 'dynamic',
          position: Vec2(metersFromPx(initialPosition.x), metersFromPx(initialPosition.y)),
          angle: initialPosition.rotation,
          userData: {
            type: 'DestructableAsteroid',
            dead: false,
          },
        }}
        fixtureDefs={fixtures}
        debugDraw={true}
        bodyCallback={callback}
      >
        {textures && (
          <AnimatedSprite
            anchor={0.5}
            textures={textures}
            isPlaying={true}
            animationSpeed={0.01}
            scale={initialPosition.scale}
            loop={true}
            x={0}
            y={0}
            initialFrame={initialPosition.initialFrame}
          />
        )}
      </PlanckBody>
    </>
  )
}
