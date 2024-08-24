'use client'
import { Container, Stage as PixiStage, withFilters } from '@pixi/react'
import { MouseEvent, useCallback, ReactNode } from 'react'
import { PixelateFilter } from '@pixi/filter-pixelate'
import ErrorBoundary from 'src/components/ErrorBoundary'
import { type ContextBridge, useContextBridge } from 'its-fine'
import DebugIndicator from './DebugIndicator'
import { OPTIONS } from './OPTIONS'

const Filters = withFilters(Container, {
  pixelate: PixelateFilter,
  // advancedBloomFilter: AdvancedBloomFilter,
})

export default function PixiStage_({ children }: { children: ReactNode }) {
  return <BridgedPixiStage>{children}</BridgedPixiStage>
}

function BridgedPixiStage({ children }: { children: ReactNode }) {
  // Returns a bridged context provider that forwards context.
  const Bridge: ContextBridge = useContextBridge()
  const contextMenu = useCallback((e: MouseEvent) => {
    // Disable the context menu so we can use right-clicks for game actions.
    e.preventDefault()
    return false
  }, [])

  // Setting up a <Bridge> within the Pixi renderer context lets us pass all
  // React contexts between it and the ReactDOM renderer.
  return (
    <PixiStage
      width={OPTIONS.width}
      height={OPTIONS.height}
      options={OPTIONS}
      onContextMenu={contextMenu}
    >
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
        <Bridge>
          <ErrorBoundary>{children}</ErrorBoundary>
          <DebugIndicator />
        </Bridge>
      </Filters>
    </PixiStage>
  )
}
