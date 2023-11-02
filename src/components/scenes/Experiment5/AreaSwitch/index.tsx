import { useState } from 'react'
import { useAvatarCurrentAreaUpdateListener } from '../world-objects/PrototypeShip/events'
import { DEFAULT_AREA } from '../areas/AsteroidFieldArea'
import { AreaId, areaMap } from './list'
import { Suspense } from 'react'
// import Curtain from '../Curtain/Curtain';
import { Text } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import { OPTIONS } from 'src/components/PixiStage'

// Precaching pages with next-pwa:
// https://dev.to/sfiquet/precaching-pages-with-next-pwa-31f2

// TODO: Open AreaDB here.

const style = new TextStyle({
  dropShadow: true,
  dropShadowAlpha: 0.8,
  fill: '0xffffff',
  fontSize: 54,
})

export default function AreaSwitch() {
  const [currentArea, setCurrentArea] = useState<AreaId>(DEFAULT_AREA)
  // console.log('AreaSwitch render  : currentArea:', currentArea)
  useAvatarCurrentAreaUpdateListener(setCurrentArea)
  const AreaComponent = areaMap[currentArea]
  return (
    <Suspense
      fallback={
        <>
          <Text
            text="Loading Area..."
            style={style}
            anchor={{ x: 0.5, y: 0.5 }}
            x={OPTIONS.width / 2}
            y={OPTIONS.height / 2}
          />
          {/* <Curtain /> */}
        </>
      }
    >
      <AreaComponent />
    </Suspense>
  )
}
