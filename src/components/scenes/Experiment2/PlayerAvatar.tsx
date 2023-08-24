import { Texture, TextStyle } from 'pixi.js'
import logo from 'src/components/Logo/etherion-logo.png'
import { useParallaxCameraRef } from 'pixi-react-parallax'
import { Sprite, Text, useTick } from '@pixi/react'
import PlanckBody from './PlanckBody'
import { Box, Body, Vec2 } from 'planck'
import { useHotkeys } from 'react-hotkeys-hook'
import { useCallback, useRef, useState } from 'react'
import { metersFromPx } from 'src/utils/physics'
import { useMessageListener } from './events'
import {
  useMoveActivateListener,
  useMoveDisengageListener,
  useMoveEngageListener,
} from './Button/events'

export interface AnimatedLogoProps {
  x?: number
  y?: number
  rotation?: number
  scale?: number
}

const fixtures = [
  {
    shape: Box(1.0, 1.0),
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
  const bodyRef = useRef<Body>()
  const callback = useCallback(
    (body: Body) => {
      bodyRef.current = body
    },
    [bodyRef]
  )

  const isKeyDown = useRef<boolean>(false)
  const eventHandler = useCallback(
    (event: KeyboardEvent | MouseEvent /*, handler: HotkeysEvent */) => {
      // console.log('avatar rcvd > event.type:', event.type)
      if ('repeat' in event && event?.repeat) {
        return
      }
      // console.log('eventHandler  > event.type:', event.type, event)
      const body = bodyRef.current
      if (event.type === 'keydown' || event.type === 'pointerdown') {
        isKeyDown.current = true
        body?.applyLinearImpulse(Vec2(0.0, 200.0), body.getPosition())
      }
      setCount((count) => {
        if (event.type === 'keydown' || event.type === 'pointerdown') {
          return count + 1
        } else {
          return count
        }
      })
      if (event.type === 'keyup' || event.type === 'pointerup' || event.type === 'pointerout') {
        isKeyDown.current = false
      }
    },
    []
  )
  useMessageListener(eventHandler)
  useMoveEngageListener(eventHandler)
  useMoveDisengageListener(eventHandler)
  useMoveActivateListener(eventHandler)
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
      body?.applyForce(Vec2(0.0, 400.0), body.getPosition())
    }
  }, [])
  useTick(update)
  return (
    <PlanckBody
      bodyDef={{
        type: 'dynamic',
        position: Vec2(metersFromPx(x), metersFromPx(y)),
        angle: rotation,
      }}
      fixtureDefs={fixtures}
      ref={setCameraTargetRef}
      debugDraw={true}
      getBody={callback}
    >
      <Sprite
        anchor={0.5}
        texture={Texture.from(logo.src)}
        // {...props}
        // onpointerup={click}
        cursor="pointer"
        eventMode="dynamic"
      />
      {count !== undefined && (
        <Text
          text={count.toString()}
          style={new TextStyle({ fill: '0xcccccc', fontSize: '38px' })}
          // {...props}
          x={120}
          y={-100}
        />
      )}
      {currentY !== undefined && (
        <Text
          text={currentY?.toFixed(2)}
          style={new TextStyle({ fill: '0xcccccc', fontSize: '38px' })}
          // {...props}
          x={120}
          y={-60}
        />
      )}
      {currentSpeed !== undefined && (
        <Text
          text={currentSpeed?.toFixed(2)}
          style={new TextStyle({ fill: '0xcccccc', fontSize: '38px' })}
          // {...props}
          x={120}
          y={-20}
        />
      )}
    </PlanckBody>
  )
}
