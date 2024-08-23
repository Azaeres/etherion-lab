import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { createContext, useContext } from 'react'

export type NextNavigationContextType = {
  router: AppRouterInstance
  pathname: string
  searchParams: URLSearchParams
} | null
export const NextNavigationContext = createContext<NextNavigationContextType>(null)

export default function useNextjsRouter(): NextNavigationContextType {
  return useContext(NextNavigationContext)
}
