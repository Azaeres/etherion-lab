import React from 'react'
import { Container } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import TextFromWord, { WordData } from './TextFromWord'
import { AnimatingCharacter } from '.'

export type LineData = {
  key: string
  line: string
  y: number
  lineWords: string[]
  wordData: WordData[]
  lineWidth: number
}

export default function TextFromLine({
  lineData,
  style,
  animatedValues,
}: {
  lineData: LineData
  style: TextStyle
  animatedValues: Record<string, AnimatingCharacter>
}) {
  // Positioning the line of text in the center of the screen based on the width of the line.
  // This has the effect of center justifying the text.
  return (
    <Container x={-lineData.lineWidth / 2}>
      {lineData.wordData.map((wordData) => {
        const key = `${lineData.key}:${wordData.key}`
        return (
          <TextFromWord
            wordData={wordData}
            key={key}
            style={style}
            y={lineData.y}
            animatedValues={animatedValues}
            animationKey={key}
          />
        )
      })}
    </Container>
  )
}
