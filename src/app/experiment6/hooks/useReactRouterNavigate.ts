import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export default function useReactRouterNavigate() {
  const navigate = useNavigate()
  return useCallback((href: string) => () => navigate(href), [navigate])
}
