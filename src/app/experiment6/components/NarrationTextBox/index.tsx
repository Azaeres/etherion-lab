import React, { useMemo, useState } from 'react'
import { Container } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import { OPTIONS } from '../../OPTIONS'
import Anime, { AnimeControls, AnimeWrapperParams } from '../../Anime'
import { TextMetrics } from '@pixi/text'
import anime, { AnimeInstance } from 'animejs'
import BoundingBox from './BoundingBox'
import CtcArrow from './CtcArrow'
import TextFromLineData from './TextFromLineData'
import { getAllCharacterData, getLineData, type DisplayData } from './dataFactoryUtils'
import useRerenderOnFontsLoaded from '../../hooks/useRerenderOnFontsLoaded'

interface Props {
  text: string
  wordWrapWidth: number
  onComplete?: (anim: AnimeInstance) => void
  animationControls?: React.MutableRefObject<AnimeControls | null>
}

export type AnimatingCharacter = {
  alpha: number
  dropShadowColor?: string | number
}
type NarrationTextAnimationValues = Record<string, AnimatingCharacter>
type NarrationTextBoxAnimationValues = {
  box: {
    alpha: number
  }
}
type TransitionState = 'running' | 'idle'

const defaultValues = { box: { alpha: 0.0 } } as const
const boxFlightPlan: AnimeWrapperParams<NarrationTextBoxAnimationValues>[] = [
  {
    autoplay: true,
    easing: 'easeInOutQuad',
    duration: 1400,
  },
  {
    targets: ['box'],
    alpha: 1.0,
  },
] as const

export default function NarrationTextBox({
  text,
  wordWrapWidth,
  onComplete,
  animationControls,
}: Props) {
  const fontsLoaded = useRerenderOnFontsLoaded()
  const style = useMemo(() => {
    return new TextStyle({
      fontFamily: `Roboto Condensed, sans-serif`,
      // fontStyle: inter.style.fontStyle as TextStyleFontStyle,
      fontSize: 48, //48,
      fill: 0xffffff,
      dropShadow: true,
      dropShadowAlpha: 0.6,
      dropShadowDistance: 4,
      dropShadowBlur: 8,
      dropShadowColor: 0xffffff, // 0xffffff, // 0x000000,
      dropShadowAngle: Math.PI / 2,
      wordWrap: true,
      wordWrapWidth,
    })
  }, [wordWrapWidth, fontsLoaded])
  const displayData = useMemo(() => {
    const textData = TextMetrics.measureText(text, style, true)
    const displayData: DisplayData = {
      textData,
      lineData: getLineData(textData, style),
    }
    return displayData
  }, [text, style])
  const allCharacterData = useMemo(() => {
    return getAllCharacterData(displayData)
  }, [displayData])
  const [transition, setTransition] = useState<TransitionState>('running')
  const textAnimFlightPlan: AnimeWrapperParams<NarrationTextAnimationValues>[] = useMemo(
    () =>
      [
        {
          autoplay: true,
          easing: 'linear',
          duration: 100,
        },
        {
          targets: Object.keys(allCharacterData),
          alpha: 1.0,
          delay: anime.stagger(20, { start: 200 }),
          complete: (anim: AnimeInstance) => {
            onComplete?.(anim)
            setTransition('idle')
          },
        },
      ] as const,
    [allCharacterData, onComplete]
  )

  return (
    <Anime<NarrationTextBoxAnimationValues>
      defaultValues={defaultValues}
      flightPlan={boxFlightPlan}
    >
      {({ box }) => (
        <Container alpha={box.alpha}>
          <BoundingBox
            x={OPTIONS.width / 2 - (displayData.textData.width + 260) / 2}
            y={OPTIONS.height - displayData.textData.height - 230 - 40}
            width={displayData.textData.width + 300}
            height={displayData.textData.height + 200}
          />
          <Anime<NarrationTextAnimationValues>
            defaultValues={allCharacterData}
            flightPlan={textAnimFlightPlan}
            ref={animationControls}
          >
            {(animatedValues) => (
              <TextFromLineData
                lineData={displayData.lineData}
                style={style}
                x={OPTIONS.width / 2 + 20}
                y={OPTIONS.height - (displayData.textData.height + 260) + 90}
                animatedValues={animatedValues}
              />
            )}
          </Anime>
          {transition === 'idle' && <CtcArrow textData={displayData.textData} />}
        </Container>
      )}
    </Anime>
  )
}
