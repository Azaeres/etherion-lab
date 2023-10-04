import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { createContext, useContext } from 'react'

export const NextNavigationContext = createContext<AppRouterInstance | null>(null)

export default function useNextjsRouter(): AppRouterInstance | null {
  return useContext(NextNavigationContext)
}
