import React from 'react'
import { Text } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import { TextMetrics } from '@pixi/text'
import type { AnimatingCharacter } from '.'

export type CharacterData = {
  x: number
  alpha: number
  character: string
  key: string
  metrics: TextMetrics
}

export default function TextFromCharacter({
  characterData,
  lineY,
  style,
  animatedValues,
}: {
  characterData: CharacterData
  lineY: number
  style: TextStyle
  animatedValues: AnimatingCharacter
}) {
  return (
    <Text
      text={characterData.character}
      x={characterData.x}
      y={lineY}
      alpha={animatedValues?.alpha === undefined ? 1.0 : animatedValues.alpha}
      style={style}
    />
  )
}
