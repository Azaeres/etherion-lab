import { PropsWithChildren, ReactElement } from 'react'
import { useMediaQuery } from 'react-responsive'
import * as PIXI from 'pixi.js'

export default function MobileView({
  children,
}: Partial<PropsWithChildren<ReactElement<PIXI.Container>>>) {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
  if (isTabletOrMobile) {
    return <>{children}</>
  } else {
    return null
  }
}
