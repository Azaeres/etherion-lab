'use client'
import { useCallback } from 'react'
import PixiStage from 'src/components/PixiStage'
import { useRouter } from 'next/navigation'
import { NavigateOptions } from 'next/dist/shared/lib/app-router-context'
import Logo from 'src/components/Logo'

let count = 0

export default function Home() {
  console.log('Home page render  :', count++)
  return (
    <PixiStage color={0x10bb99}>
      <Logo
        x={200}
        onpointerup={useNavigateCallback('/experiment1')}
        cursor="pointer"
        interactive
      />
    </PixiStage>
  )
}

export function useNavigateCallback(href: string, options?: NavigateOptions) {
  const router = useRouter()
  return useCallback(() => {
    router.push(href, options)
  }, [router, href, options])
}
