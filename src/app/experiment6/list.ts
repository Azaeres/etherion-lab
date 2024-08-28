import { lazy } from 'react'
// import { delay } from '../utils/delay'

export const verseMap = {
  'zhariel/1/1': lazy(() => import('./zhariel/1/1')),
  'zhariel/1/2': lazy(() => import('./zhariel/1/2')),
  'zhariel/1/3': lazy(() => import('./zhariel/1/3')),
  'zhariel/1/4': lazy(() => import('./zhariel/1/4')),
} as const

export type VerseId = keyof typeof verseMap
const verses = Object.keys(verseMap) as ReadonlyArray<VerseId>
export default verses
