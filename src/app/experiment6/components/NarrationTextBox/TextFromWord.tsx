import React from 'react'
import { Container } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import { TextMetrics } from '@pixi/text'
import type { CharacterData } from './TextFromCharacter'
import TextFromCharacter from './TextFromCharacter'
import { AnimatingCharacter } from '.'

export type WordData = {
  x: number
  metrics: TextMetrics
  key: string
  word: string
  characterData: CharacterData[]
}

export default function TextFromWord({
  wordData,
  style,
  y,
  animatedValues,
  animationKey,
}: {
  wordData: WordData
  style: TextStyle
  y: number
  animatedValues: Record<string, AnimatingCharacter>
  animationKey: string
}) {
  return (
    <Container x={wordData.x}>
      {wordData.characterData.map((characterData) => {
        return (
          <TextFromCharacter
            characterData={characterData}
            key={characterData.key}
            lineY={y}
            style={style}
            animatedValues={animatedValues[`${animationKey}:${characterData.key}`]!}
          />
        )
      })}
    </Container>
  )
}
