'use client'
import { PropsWithChildren } from 'react'
import usePWA from './PWA'

export default function Client({ children }: PropsWithChildren) {
  usePWA()
  return <>{children}</>
}
