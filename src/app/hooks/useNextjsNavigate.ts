import { useCallback } from 'react'
import useNextjsRouter from './useNextjsRouter'
import { SceneId } from '../[scene]/scenes'

export default function useNextjsNavigate() {
  const router = useNextjsRouter()
  return useCallback((href: SceneId) => () => router.push(href), [router])
}
