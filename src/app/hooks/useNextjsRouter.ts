import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context'
import { createContext, useContext } from 'react'

export const NextNavigationContext = createContext<AppRouterInstance | null>(null)

export default function useNextjsRouter() {
  return useContext(NextNavigationContext) as AppRouterInstance
}
