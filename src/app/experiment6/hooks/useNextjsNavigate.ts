import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function useNextjsNavigate() {
  const router = useRouter()
  return useCallback((href: string) => () => router.push(href), [router])
}
