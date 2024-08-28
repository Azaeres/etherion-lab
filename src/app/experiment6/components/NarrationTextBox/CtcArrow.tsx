import React from 'react'
import { Sprite } from '@pixi/react'
import { Texture } from 'pixi.js'
import { OPTIONS } from '../../OPTIONS'
import Anime, { AnimeWrapperParams } from '../../Anime'
import { TextMetrics } from '@pixi/text'
import arrowImage from './assets/images/ctc_arrow.png'
import reflectionImage from './assets/images/ctc_arrow_reflection.png'

type CtcArrowAnimationValues = {
  arrow: {
    verticalOffset: number
  }
  reflection: {
    alpha: number
  }
}

const arrowDefaultValues = {
  arrow: {
    verticalOffset: 0,
  },
  reflection: {
    alpha: 0.5,
  },
} as const

const arrowFlightPlan: AnimeWrapperParams<CtcArrowAnimationValues>[] = [
  {
    autoplay: true,
    easing: 'easeInOutQuad',
    duration: 1000,
    direction: 'alternate',
    loop: true,
  },
  {
    targets: ['arrow'],
    verticalOffset: 20,
  },
  {
    targets: ['reflection'],
    alpha: 1.0,
  },
] as const

const arrowImageTexture = Texture.from(arrowImage.src)
const reflectionImageTexture = Texture.from(reflectionImage.src)

const CTC_ARROW_WIDTH = 175
const CTC_ARROW_HEIGHT = 144

export default function CtcArrow({ textData }: { textData: TextMetrics }) {
  return (
    <Anime<CtcArrowAnimationValues> defaultValues={arrowDefaultValues} flightPlan={arrowFlightPlan}>
      {(animationValues) => (
        <>
          <Sprite
            texture={arrowImageTexture}
            x={
              OPTIONS.width / 2 -
              (CTC_ARROW_WIDTH / 2) * 0.5 +
              textData.width / 2 +
              40 -
              textData.width * 0.05
            }
            y={OPTIONS.height - CTC_ARROW_HEIGHT * 0.5 - 110 + animationValues.arrow.verticalOffset}
            scale={0.5}
          />
          <Sprite
            texture={reflectionImageTexture}
            x={
              OPTIONS.width / 2 -
              (CTC_ARROW_WIDTH / 2) * 0.5 +
              textData.width / 2 +
              58 -
              textData.width * 0.05
            }
            y={OPTIONS.height - CTC_ARROW_HEIGHT * 0.5 - 20 - animationValues.arrow.verticalOffset}
            alpha={animationValues.reflection.alpha}
            scale={0.5}
          />
        </>
      )}
    </Anime>
  )
}
