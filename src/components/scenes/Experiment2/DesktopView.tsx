import { PropsWithChildren, ReactElement } from 'react'
import { useMediaQuery } from 'react-responsive'
import * as PIXI from 'pixi.js'

export default function DesktopView({
  children,
}: Partial<PropsWithChildren<ReactElement<PIXI.Container>>>) {
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)',
  })
  if (isDesktopOrLaptop) {
    return <>{children}</>
  } else {
    return null
  }
}
