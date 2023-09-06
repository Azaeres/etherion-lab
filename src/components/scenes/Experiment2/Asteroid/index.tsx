import { ComponentProps, PropsWithChildren, useCallback, useMemo, useRef } from 'react'
import asteroidsTexture from '../assets/asteroids/asteroids.webp'
import asteroidsJson from '../assets/asteroids/asteroids.json'
import { AnimatedSprite, Sprite, useTick } from '@pixi/react'
import { OPTIONS } from 'src/components/PixiStage'
import PlanckBody from '../PlanckBody'
import { Box, Vec2, Body, BodyDef } from 'planck'
import {
  Meters,
  Pixels,
  Vec2Meters,
  Vec2Pixels,
  metersFromPx,
  pxFromMeters,
} from 'src/utils/physics'
import useSpritesheetTextures from 'src/app/hooks/useSpritesheetTextures'
import { AnimatedSprite as PixiAnimatedSprite } from 'pixi.js'

type AsteroidConfig = {
  position: Vec2Pixels
  rotation: number
  initialFrame: number
  scale: number
}

const CULLING_DISTANCE = 6000
const ASTEROID_TINT = '#666'

export interface DestructableAsteroidProps extends ComponentProps<typeof Sprite> {
  cameraPosition?: Vec2Pixels
  destroy?: () => void
  id?: string
  x?: Pixels
  y?: Pixels
  physical?: boolean
  cullingDistance?: number
}

export default function Asteroid(props: DestructableAsteroidProps) {
  const { cameraPosition, destroy, x, y, physical = true, cullingDistance } = props
  const initialConfig: AsteroidConfig = useMemo(() => {
    const position = new Vec2(
      x === undefined ? Math.random() * OPTIONS.width * 3 - OPTIONS.width : x,
      y === undefined ? Math.random() * OPTIONS.height * 3 - OPTIONS.height : y
    ) as Vec2Pixels
    return {
      position,
      rotation: Math.random() * 2 * Math.PI,
      initialFrame: Math.floor(Math.random() * 64),
      scale: Math.random() * 4.6 + 0.6,
    } as const
  }, [x, y])
  const textures = useSpritesheetTextures(asteroidsTexture.src, asteroidsJson)
  const bodyRef = useRef<Body>()
  const spriteRef = useRef<PixiAnimatedSprite>()
  const update = useCallback(() => {
    const pxPosition: Vec2Pixels | undefined = (() => {
      if (physical) {
        const metersPosition: Vec2Meters | undefined = bodyRef.current?.getPosition() as Vec2Meters
        return metersPosition
          ? (new Vec2(
              pxFromMeters(-metersPosition.x as Meters),
              pxFromMeters(metersPosition.y)
            ) as Vec2Pixels)
          : undefined
      } else {
        return spriteRef.current
          ? (new Vec2(-spriteRef.current.x, -spriteRef.current.y) as Vec2Pixels)
          : undefined
      }
    })()
    // console.log(' > pxPosition:', pxPosition)
    const _isSafe = isPositionWithinCameraBounds(pxPosition, cameraPosition, cullingDistance)
    if (!_isSafe && destroy) {
      // debugger
      destroy()
    }
  }, [cameraPosition, cullingDistance, destroy, physical])
  useTick(update)
  const bodyCallback = useCallback((body: Body) => {
    bodyRef.current = body
  }, [])
  const spriteCallback = useCallback((sprite: PixiAnimatedSprite) => {
    spriteRef.current = sprite
  }, [])
  if (physical) {
    return (
      <PhysicalAsteroid initialConfig={initialConfig} bodyCallback={bodyCallback}>
        {textures && (
          <AnimatedSprite
            anchor={0.5}
            textures={textures}
            isPlaying={true}
            animationSpeed={0.01}
            scale={initialConfig.scale}
            loop={true}
            x={0}
            y={0}
            initialFrame={initialConfig.initialFrame}
          />
        )}
        {/* <Text text={`Safe: ${isSafe}`} style={styles.body} scale={1.8} /> */}
      </PhysicalAsteroid>
    )
  } else {
    return (
      textures && (
        <AnimatedSprite
          anchor={0.5}
          textures={textures}
          isPlaying={true}
          animationSpeed={0.01}
          scale={initialConfig.scale}
          tint={ASTEROID_TINT}
          loop={true}
          x={initialConfig.position.x}
          y={initialConfig.position.y}
          initialFrame={initialConfig.initialFrame}
          ref={spriteCallback}
        />
      )
    )
  }
}

interface PhysicalAsteroidProps {
  initialConfig: AsteroidConfig
  bodyCallback?: (body: Body) => void
}

function PhysicalAsteroid(props: PropsWithChildren<PhysicalAsteroidProps>) {
  const { initialConfig, children, bodyCallback } = props
  const bodyDef = useMemo<BodyDef>(() => {
    const position = new Vec2(
      metersFromPx(initialConfig.position.x),
      metersFromPx(initialConfig.position.y)
    )
    return {
      type: 'dynamic',
      position,
      angle: initialConfig.rotation,
    } as const
  }, [])
  const fixtures = useMemo(() => {
    return [
      {
        shape: Box(0.3 * initialConfig.scale, 0.3 * initialConfig.scale),
        density: 0.3 * initialConfig.scale,
        friction: 0.3,
      },
    ]
  }, [initialConfig.scale])
  return (
    <PlanckBody
      bodyDef={bodyDef}
      fixtureDefs={fixtures}
      debugDraw={false}
      bodyCallback={bodyCallback}
    >
      {children}
    </PlanckBody>
  )
}

function isPositionWithinCameraBounds(
  position?: Vec2,
  cameraPosition?: Vec2,
  cullingDistance: number = CULLING_DISTANCE
) {
  if (cameraPosition && position) {
    const horizDistance = Math.abs(position.x - cameraPosition.x)
    const vertDistance = Math.abs(position.y - cameraPosition.y)
    // console.log(' > horizDistance, vertDistance:', horizDistance, vertDistance)
    // debugger
    return horizDistance <= cullingDistance && vertDistance <= cullingDistance
  } else {
    return null
  }
}

// function getPositionString(position: Vec2 | null) {
//   if (position) {
//     return `[${position.x.toFixed(2)}, ${position.y.toFixed(2)}]`
//   } else {
//     return ''
//   }
// }
