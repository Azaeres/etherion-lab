import { Graphics } from '@pixi/react'
import { Graphics as PixiGraphics } from 'pixi.js'
import { useCallback, useMemo } from 'react'
import Anime, { AnimeWrapperParams } from './Anime'
import { OPTIONS } from './OPTIONS'

type AnimationValues = {
  curtain: {
    alpha: number
  }
}

const defaultValues = {
  curtain: {
    alpha: 1.0,
  },
} as const

export interface CurtainProps {
  duration?: number
}

export default function Curtain(props: CurtainProps) {
  const flightPlan: AnimeWrapperParams<AnimationValues>[] = useMemo(
    () =>
      [
        {
          autoplay: true,
          duration: props.duration ?? 300,
          easing: 'linear',
        },
        {
          targets: ['curtain'],
          alpha: 0.0,
        },
      ] as const,
    [props.duration]
  )

  const draw = useCallback((g: PixiGraphics) => {
    const fill = 0x000000
    const alpha = 1.0 // 0.0001
    g.clear()
    g.beginFill(fill, alpha)
    g.drawRect(0, 0, OPTIONS.width, OPTIONS.height)
    g.endFill()
  }, [])
  return (
    <Anime<AnimationValues> defaultValues={defaultValues} flightPlan={flightPlan}>
      {({ curtain }) => <Graphics alpha={curtain.alpha} draw={draw} />}
    </Anime>
  )
}
