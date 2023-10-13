import { useState } from 'react'
import { useAvatarCurrentAreaUpdateListener } from '../PrototypeShip/events'
import { DEFAULT_AREA } from '../areas/AsteroidFieldArea'
import { AreaId, areaMap } from './areas'

// Precaching pages with next-pwa:
// https://dev.to/sfiquet/precaching-pages-with-next-pwa-31f2

// TODO: Open AreaDB here.

export default function AreaSwitch() {
  const [currentArea, setCurrentArea] = useState<AreaId>(DEFAULT_AREA)
  useAvatarCurrentAreaUpdateListener(setCurrentArea)
  const AreaComponent = areaMap[currentArea].Component
  return <AreaComponent />
}
