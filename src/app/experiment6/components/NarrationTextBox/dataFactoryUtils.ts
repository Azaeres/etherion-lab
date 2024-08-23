import { TextStyle } from 'pixi.js'
import { TextMetrics } from '@pixi/text'
import { WordData } from './TextFromWord'
import { LineData } from './TextFromLine'
import { AnimatingCharacter } from '.'
import type { CharacterData } from './TextFromCharacter'

export type DisplayData = {
  textData: TextMetrics
  lineData: LineData[]
}

const CHARACTER_SPACING = -4.4
const WORD_SPACING = 4.0

export function getAllCharacterData(displayData: DisplayData): Record<string, AnimatingCharacter> {
  return displayData.lineData.reduce<Record<string, AnimatingCharacter>>((acc, lineData) => {
    return lineData.wordData.reduce<Record<string, AnimatingCharacter>>((acc, wordData) => {
      return wordData.characterData.reduce<Record<string, AnimatingCharacter>>(
        (acc, characterData) => {
          return {
            ...acc,
            [`${lineData.key}:${wordData.key}:${characterData.key}`]: { alpha: 0.0 },
          }
        },
        acc
      )
    }, acc)
  }, {})
}

export function getLineData(textData: TextMetrics, style: TextStyle): LineData[] {
  return textData.lines.reduce<LineData[]>((previousValue, line, lineIndex) => {
    const lineWords = line.split(' ')
    return [
      ...previousValue,
      {
        key: `line-${lineIndex}`,
        line,
        y: lineIndex * textData.lineHeight,
        wordData: getLineWordData(lineWords, style),
        lineWords,
        lineWidth: textData.lineWidths[lineIndex]!,
      },
    ]
  }, [])
}

export function getLineWordData(lineWords: string[], style: TextStyle): WordData[] {
  return lineWords.reduce<WordData[]>((acc, word, wordIndex) => {
    const metrics = TextMetrics.measureText(word, style)
    const previousWordX = acc[wordIndex - 1]?.x || 0
    const previousWordWidth = acc[wordIndex - 1]?.metrics.width || 0
    return [
      ...acc,
      {
        x: previousWordX + previousWordWidth + WORD_SPACING,
        metrics,
        key: `word-${wordIndex}`,
        word,
        characterData: getCharacterData(word, style),
      },
    ]
  }, [])
}

export function getCharacterData(word: string, style: TextStyle): CharacterData[] {
  const characters = word.split('')
  return characters.reduce<CharacterData[]>((previousValue, char, index) => {
    const key = `char-${index}`
    const metrics = TextMetrics.measureText(char, style)
    const previousX = previousValue[index - 1]?.x || 0
    const previousWidth = previousValue[index - 1]?.metrics.width || 0

    return [
      ...previousValue,
      {
        x: previousX + previousWidth + CHARACTER_SPACING,
        alpha: 1.0,
        character: char,
        key,
        metrics,
      },
    ]
  }, [])
}
