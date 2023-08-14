'use client'
import { Container, Stage, withFilters } from '@pixi/react'
import { PropsWithChildren } from 'react'
import { useRouter } from 'next/navigation'
import { PixelateFilter } from '@pixi/filter-pixelate'
import DebugIndicator from '../DebugIndicator'
import { NextNavigationContext } from 'src/app/hooks/useNextjsRouter'
import { SceneId } from 'src/app/[scene]/scenes'
import SceneSwitch from './SceneSwitch'

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
})

export default function PixiStage({ scene }: PropsWithChildren<Props>) {
  const router = useRouter()
  // Setting up a provider within the Pixi renderer context lets us pass the router
  // over from the DOM context.
  return (
    <Stage width={OPTIONS.width} height={OPTIONS.height} options={OPTIONS}>
      <NextNavigationContext.Provider value={router}>
        <Filters pixelate={{ size: 4 }}>
          <SceneSwitch currentScene={scene} />
          <DebugIndicator />
        </Filters>
      </NextNavigationContext.Provider>
    </Stage>
  )
}

// PixiStage.whyDidYouRender = true
