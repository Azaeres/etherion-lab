import { PropsWithChildren, ReactElement } from 'react'
import { useMediaQuery } from 'react-responsive'
import { Container } from 'pixi.js'

export default function DesktopView({
  children,
}: Partial<PropsWithChildren<ReactElement<Container>>>) {
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)',
  })
  if (isDesktopOrLaptop) {
    return <>{children}</>
  } else {
    return null
  }
}
