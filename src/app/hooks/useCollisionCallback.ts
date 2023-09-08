import { Contact, Body } from 'planck'
import { useCallback, useContext, useEffect } from 'react'
import { PlanckWorldContext } from 'src/components/scenes/Experiment2/PlanckWorldProvider'

export default function useCollisionCallback(
  beginContactCallback: (contact: Contact, strength: number) => void,
  physicsBody?: Body
) {
  const world = useContext(PlanckWorldContext)
  const onEndContactListener = useCallback(
    (contact: Contact) => {
      const manifold = contact.getManifold()
      const impulses = manifold.points.map((point) => point.normalImpulse)
      const strength = Math.max(...impulses)
      const bodyA = contact.getFixtureA().getBody()
      const bodyB = contact.getFixtureB().getBody()
      if (bodyA === physicsBody || bodyB === physicsBody) {
        beginContactCallback(contact, strength)
      }
    },
    [beginContactCallback, physicsBody]
  )
  useEffect(() => {
    world?.on('post-solve', onEndContactListener)
    return () => {
      world?.off('post-solve', onEndContactListener)
    }
  }, [onEndContactListener, world])
}
