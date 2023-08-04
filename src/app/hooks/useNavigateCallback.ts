import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { NavigateOptions } from 'next/dist/shared/lib/app-router-context'

export default function useNavigateCallback(href: string, options?: NavigateOptions) {
  const router = useRouter()
  return useCallback(() => {
    router.push(href, options)
  }, [router, href, options])
}
