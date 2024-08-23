'use client'
import { Container, Stage, withFilters } from '@pixi/react'
import { PropsWithChildren, MouseEvent, useCallback, useContext, memo } from 'react'
import { useRouter } from 'next/navigation'
import { PixelateFilter } from '@pixi/filter-pixelate'
import { NextNavigationContext } from 'src/app/hooks/useNextjsRouter'
import SceneSwitch from './SceneSwitch'
import { SceneId } from './list'
// import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom'
import { usePathname, useSearchParams } from 'next/navigation'
import ErrorBoundary from '../ErrorBoundary'
import {
  AppRouterContext,
  GlobalLayoutRouterContext,
  LayoutRouterContext,
  MissingSlotContext,
  TemplateContext,
} from 'next/dist/shared/lib/app-router-context.shared-runtime'

export const OPTIONS = {
  width: 2592,
  height: 1080,
  // antialias: true, // Causing frequent webkit crashes on iOS.
  hello: true,
  // Using the default resolution caused inconsistent canvas
  // sizes between Apple and non-Apple devices.
  resolution: 1,
  // backgroundColor: 0x000000,
} as const

interface Props {
  scene: SceneId
}

export const Filters = withFilters(Container, {
  pixelate: PixelateFilter,
  // advancedBloomFilter: AdvancedBloomFilter,
})

const PixiStage = memo(function PixiStage({ scene, children }: PropsWithChildren<Props>) {
  console.log('PixiStage render  > scene:', scene)
  const layoutRouterContext = useContext(LayoutRouterContext)
  const globalLayoutRouterContext = useContext(GlobalLayoutRouterContext)
  const appRouterContext = useContext(AppRouterContext)
  const templateRouterContext = useContext(TemplateContext)
  const missingSlotContext = useContext(MissingSlotContext)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const contextMenu = useCallback((e: MouseEvent) => {
    // Disable the context menu so we can use right-clicks for game actions.
    e.preventDefault()
    return false
  }, [])

  // Setting up a provider within the Pixi renderer context lets us pass the router
  // over from the DOM context.
  // TODO: Use the its-fine ContextBridge to forward all React contexts instead.
  return (
    <Stage
      width={OPTIONS.width}
      height={OPTIONS.height}
      options={OPTIONS}
      onContextMenu={contextMenu}
    >
      <AppRouterContext.Provider value={appRouterContext}>
        <GlobalLayoutRouterContext.Provider value={globalLayoutRouterContext}>
          <LayoutRouterContext.Provider value={layoutRouterContext}>
            <TemplateContext.Provider value={templateRouterContext}>
              <MissingSlotContext.Provider value={missingSlotContext}>
                <NextNavigationContext.Provider value={{ router, pathname, searchParams }}>
                  <Filters
                    pixelate={{ size: 4 }}
                    // advancedBloomFilter={{
                    //   threshold: 0.5232,
                    //   bloomScale: 0.864,
                    //   brightness: 0.991,
                    //   blur: 7.54,
                    //   quality: 5,
                    // }}
                  >
                    <ErrorBoundary>
                      {children === undefined ? <SceneSwitch currentScene={scene} /> : children}
                    </ErrorBoundary>
                  </Filters>
                </NextNavigationContext.Provider>
              </MissingSlotContext.Provider>
            </TemplateContext.Provider>
          </LayoutRouterContext.Provider>
        </GlobalLayoutRouterContext.Provider>
      </AppRouterContext.Provider>
    </Stage>
  )
})

export default PixiStage

// PixiStage.whyDidYouRender = true
