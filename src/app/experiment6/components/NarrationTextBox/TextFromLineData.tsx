import React from 'react'
import { Container } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import TextFromLine, { LineData } from './TextFromLine'
import { AnimatingCharacter } from '.'

export default function TextFromLineData({
  lineData,
  style,
  x,
  y,
  alpha,
  scale,
  animatedValues,
}: {
  lineData: LineData[]
  style: TextStyle
  x: number
  y: number
  animatedValues: Record<string, AnimatingCharacter>
  alpha?: number
  scale?: number
}) {
  return (
    <Container
      x={x}
      y={y}
      alpha={alpha === undefined ? 1.0 : alpha}
      scale={scale === undefined ? 1.0 : scale}
    >
      {lineData.map((lineData) => {
        return (
          <TextFromLine
            lineData={lineData}
            key={lineData.key}
            style={style}
            animatedValues={animatedValues}
          />
        )
      })}
    </Container>
  )
}
