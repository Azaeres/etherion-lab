import { ComponentProps, useCallback, useMemo, useRef } from 'react'
import asteroidsTexture from '../assets/asteroids/asteroids.webp'
import asteroidsJson from '../assets/asteroids/asteroids.json'
import { AnimatedSprite, Sprite, useTick } from '@pixi/react'
import { OPTIONS } from 'src/components/PixiStage'
import PlanckBody from '../PlanckBody'
import { Box, Vec2, Body, BodyDef } from 'planck'
import { metersFromPx } from 'src/utils/physics'
import useSpritesheetTextures from 'src/app/hooks/useSpritesheetTextures'

export interface DestructableAsteroidProps extends ComponentProps<typeof Sprite> {
  cameraPosition?: Vec2
  destroyAsteroid?: (id: string) => void
  id: string
  x?: number
  y?: number
}

const CULLING_DISTANCE = 60

export default function DestructableAsteroid(props: DestructableAsteroidProps) {
  const { cameraPosition, destroyAsteroid, id, x, y } = props
  const initialConfig = useMemo(() => {
    return {
      position: new Vec2(
        x === undefined ? metersFromPx(Math.random() * OPTIONS.width * 3 - OPTIONS.width) : x,
        y === undefined ? metersFromPx(Math.random() * OPTIONS.height * 3 - OPTIONS.height) : y
      ),
      rotation: Math.random() * 2 * Math.PI,
      initialFrame: Math.floor(Math.random() * 64),
      scale: Math.random() * 4.6 + 0.6,
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
  const textures = useSpritesheetTextures(asteroidsTexture.src, asteroidsJson)
  const bodyRef = useRef<Body>()
  const callback = useCallback(
    (body: Body) => {
      bodyRef.current = body
    },
    [bodyRef]
  )
  // const camera = useContext(ParallaxCameraContext)
  // const [currentPosition, setCurrentPosition] = useState<Vec2 | null>(null)
  // const [isSafe, setIsSafe] = useState(true)
  const update = useCallback(() => {
    const position = bodyRef.current?.getPosition()
    if (position && cameraPosition) {
      // setCurrentPosition(position.clone())
      // const cameraPosition = new Vec2(metersFromPx(-camera.x), metersFromPx(camera.y))
      const _isSafe = isPositionWithinCameraBounds(position, cameraPosition)
      // console.log(' > _isSafe:', _isSafe)
      if (!_isSafe && destroyAsteroid) {
        // debugger
        destroyAsteroid(id)
        // setIsSafe(false)
      }
      //  else {
      //   setIsSafe(true)
      // }
    }
    //  else {
    //   setCurrentPosition(null)
    // }
  }, [cameraPosition, destroyAsteroid, id])
  useTick(update)

  // const position = useMemo(() => {
  //   console.log('useMemo get position...  :', initialConfig.x, initialConfig.y, x, y)
  //   return new Vec2(x === undefined ? initialConfig.x : x, y === undefined ? initialConfig.y : y)
  // }, [initialConfig.x, initialConfig.y, x, y])
  const bodyDef = useMemo<BodyDef>(() => {
    return {
      type: 'dynamic',
      position: initialConfig.position,
      angle: initialConfig.rotation,
    } as const
  }, [])
  // console.log(' > position:', position)
  return (
    <>
      <PlanckBody
        bodyDef={bodyDef}
        fixtureDefs={fixtures}
        debugDraw={false}
        bodyCallback={callback}
      >
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
      </PlanckBody>
    </>
  )
}

function isPositionWithinCameraBounds(position?: Vec2, cameraPosition?: Vec2) {
  // console.log('isPositionWithinCameraBounds  > position:', position, cameraPosition)
  if (cameraPosition && position) {
    const cameraX = cameraPosition.x
    const cameraY = cameraPosition.y
    const horizDistance = Math.abs(position.x - cameraX)
    const vertDistance = Math.abs(position.y - cameraY)
    // console.log(' > horizDistance, vertDistance:', horizDistance, vertDistance)
    // debugger
    return horizDistance <= CULLING_DISTANCE && vertDistance <= CULLING_DISTANCE
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
