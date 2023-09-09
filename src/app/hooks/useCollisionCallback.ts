import { Contact, Body } from 'planck'
import { useCallback, useEffect } from 'react'

export default function useCollisionCallback(
  beginContactCallback: (contact: Contact, strength: number) => void,
  physicsBody?: Body
) {
  const world = physicsBody?.getWorld()
  const onEndContactListener = useCallback(
    (contact: Contact) => {
      const bodyA = contact.getFixtureA().getBody()
      const bodyB = contact.getFixtureB().getBody()
      if (bodyA === physicsBody || bodyB === physicsBody) {
        const manifold = contact.getManifold()
        const impulses = manifold.points.map((point) => point.normalImpulse)
        const strength = Math.max(...impulses)
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
