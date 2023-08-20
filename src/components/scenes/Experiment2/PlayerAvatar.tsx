import * as PIXI from 'pixi.js'
import logo from 'src/components/Logo/etherion-logo.png'
import { useParallaxCameraRef } from 'pixi-react-parallax'
import { Sprite, Text, useTick } from '@pixi/react'
import PlanckBody from './PlanckBody'
import planck from 'planck'
import { useHotkeys } from 'react-hotkeys-hook'
import { useCallback, useRef, useState } from 'react'
import { metersFromPx } from 'src/utils/physics'
import { useMessageListener } from './events'

export interface AnimatedLogoProps {
  x?: number
  y?: number
  rotation?: number
  scale?: number
}

const fixtures = [
  {
    shape: planck.Box(1.0, 1.0),
    density: 1.0,
    friction: 0.3,
  },
] as const

export default function PlayerAvatar(props: AnimatedLogoProps) {
  const [, setCameraTargetRef] = useParallaxCameraRef()
  const { x = 0, y = 0, rotation = 0 } = props
  // const camera = useContext(ParallaxCameraContext)
  // const click = useCallback(() => {
  //   camera?.shake(40, 0.2)
  // }, [camera])
  const [count, setCount] = useState(0)
  const bodyRef = useRef<planck.Body>()
  const callback = useCallback(
    (body: planck.Body) => {
      bodyRef.current = body
    },
    [bodyRef]
  )

  const isKeyDown = useRef<boolean>(false)
  const eventHandler = useCallback(
    (event: KeyboardEvent | MouseEvent /*, handler: HotkeysEvent */) => {
      if ('repeat' in event && event?.repeat) {
        return
      }
      // console.log('eventHandler  > event.type:', event.type, event)
      const body = bodyRef.current
      if (event.type === 'keydown' || event.type === 'pointerdown') {
        isKeyDown.current = true
        body?.applyLinearImpulse(planck.Vec2(0.0, 200.0), body.getPosition())
      }
      setCount((count) => {
        if (event.type === 'keydown' || event.type === 'pointerdown') {
          return count + 1
        } else {
          return count
        }
      })
      if (event.type === 'keyup' || event.type === 'pointerup') {
        isKeyDown.current = false
      }
    },
    []
  )
  useMessageListener(eventHandler)
  useHotkeys('a', eventHandler, { keyup: true, keydown: true })

  const [currentY, setCurrentY] = useState<number | void>(bodyRef.current?.getPosition().y)
  const [currentSpeed, setCurrentSpeed] = useState<number>(0.0)
  const update = useCallback(() => {
    const alt = bodyRef.current?.getPosition().y
    if (alt !== undefined) {
      setCurrentY(alt + 27.99)
    }
    const velocity = bodyRef.current?.getLinearVelocity()
    // console.log(' > velocity:', velocity)
    if (velocity !== undefined) {
      const speed = velocity.x * velocity.x + velocity.y * velocity.y
      // console.log(' > speed:', speed)
      setCurrentSpeed(speed)
    }
    if (isKeyDown.current) {
      const body = bodyRef.current
      body?.applyForce(planck.Vec2(0.0, 400.0), body.getPosition())
    }
  }, [])
  useTick(update)
  return (
    <PlanckBody
      bodyDef={{
        type: 'dynamic',
        position: planck.Vec2(metersFromPx(x), metersFromPx(y)),
        angle: rotation,
      }}
      fixtureDefs={fixtures}
      ref={setCameraTargetRef}
      debugDraw={true}
      getBody={callback}
    >
      <Sprite
        anchor={0.5}
        texture={PIXI.Texture.from(logo.src)}
        // {...props}
        // onpointerup={click}
        cursor="pointer"
        eventMode="dynamic"
      />
      {count !== undefined && (
        <Text
          text={count.toString()}
          style={new PIXI.TextStyle({ fill: '0xcccccc', fontSize: '38px' })}
          // {...props}
          x={120}
          y={-100}
        />
      )}
      {currentY !== undefined && (
        <Text
          text={currentY?.toFixed(2)}
          style={new PIXI.TextStyle({ fill: '0xcccccc', fontSize: '38px' })}
          // {...props}
          x={120}
          y={-60}
        />
      )}
      {currentSpeed !== undefined && (
        <Text
          text={currentSpeed?.toFixed(2)}
          style={new PIXI.TextStyle({ fill: '0xcccccc', fontSize: '38px' })}
          // {...props}
          x={120}
          y={-20}
        />
      )}
    </PlanckBody>
  )
}
