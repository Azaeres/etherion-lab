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
  const animatePhysics = useCallback(() => {
    world.step(timeStep, velocityIterations, positionIterations)
  }, [positionIterations, timeStep, velocityIterations, world])
  useTick(animatePhysics)
  return <PlanckWorldContext.Provider value={world}>{props.children}</PlanckWorldContext.Provider>
}
