'use client'
import { FiberProvider } from 'its-fine'
import React, { PropsWithChildren } from 'react'

export default function Providers({ children }: PropsWithChildren) {
  return <FiberProvider>{children}</FiberProvider>
}
