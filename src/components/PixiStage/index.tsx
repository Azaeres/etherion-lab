'use client'
import { Container, Stage, withFilters } from '@pixi/react'
import { PropsWithChildren, MouseEvent, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PixelateFilter } from '@pixi/filter-pixelate'
import { NextNavigationContext } from 'src/app/hooks/useNextjsRouter'
import { SceneId } from 'src/app/[scene]/scenes'
import SceneSwitch from './SceneSwitch'
// import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom'

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

export default function PixiStage({ scene }: PropsWithChildren<Props>) {
  const router = useRouter()
  const contextMenu = useCallback((e: MouseEvent) => {
    // Disable the context menu so we can use right-clicks for game actions.
    e.preventDefault()
    return false
  }, [])

  // Setting up a provider within the Pixi renderer context lets us pass the router
  // over from the DOM context.
  return (
    <Stage
      width={OPTIONS.width}
      height={OPTIONS.height}
      options={OPTIONS}
      onContextMenu={contextMenu}
    >
      <NextNavigationContext.Provider value={router}>
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
          <SceneSwitch currentScene={scene} />
        </Filters>
      </NextNavigationContext.Provider>
    </Stage>
  )
}

// PixiStage.whyDidYouRender = true
