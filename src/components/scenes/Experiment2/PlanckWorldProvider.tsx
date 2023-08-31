import { useTick } from '@pixi/react'
import { World, Vec2 } from 'planck'
import { PropsWithChildren, createContext, useCallback, useMemo } from 'react'

export interface PlanckWorldProviderProps {
  gravityX?: number
  gravityY?: number
  timeStep?: number
  velocityIterations?: number
  positionIterations?: number
}

export const PlanckWorldContext = createContext<World | null>(null)

const destroyList = []

const isBodyDestructableAsteroid = (body) => {
  return body.getUserData()?.type === 'DestructableAsteroid'
}

const isBodyGround = (body) => {
  return body.getUserData()?.type === 'Ground'
}

export default function PlanckWorldProvider(props: PropsWithChildren<PlanckWorldProviderProps>) {
  const {
    gravityX = 0,
    gravityY = 0,
    timeStep = 1 / 60,
    velocityIterations = 6,
    positionIterations = 2,
  } = props
  const world = useMemo(() => {
    const gravity = Vec2(gravityX, gravityY)
    return World({
      gravity,
    })
  }, [gravityX, gravityY])

  world.on('begin-contact', function (contact) {
    // console.log('HAllo! ', contact)
    const bodyA = contact.getFixtureA().getBody()
    const bodyB = contact.getFixtureB().getBody()
    if (
      (isBodyDestructableAsteroid(bodyA) || isBodyDestructableAsteroid(bodyB)) &&
      (isBodyGround(bodyA) || isBodyGround(bodyB))
    ) {
      const bodyToDestroy = isBodyDestructableAsteroid(bodyA) ? bodyA : bodyB
      destroyList.push(bodyToDestroy)
    }
  })

  const animatePhysics = useCallback(() => {
    world.step(timeStep, velocityIterations, positionIterations)
    while (destroyList.length) world.destroyBody(destroyList.pop())
  }, [positionIterations, timeStep, velocityIterations, world])
  useTick(animatePhysics)
  return <PlanckWorldContext.Provider value={world}>{props.children}</PlanckWorldContext.Provider>
}
