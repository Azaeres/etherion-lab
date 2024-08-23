import { useCallback } from 'react'
import useNextjsRouter from './useNextjsRouter'
import { SceneId } from '../../components/PixiStage/list'

export default function useNextjsNavigate() {
  const navigation = useNextjsRouter()
  const router = navigation?.router
  return useCallback(
    (href: SceneId) => () => {
      router?.push(href)
    },
    [router]
  )
}
