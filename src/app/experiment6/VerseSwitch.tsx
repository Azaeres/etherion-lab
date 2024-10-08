import { VerseId, verseMap } from './list'
import { Suspense } from 'react'
import { Text } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import Curtain from './Curtain'
import { OPTIONS } from './OPTIONS'

const style = new TextStyle({
  dropShadow: true,
  dropShadowAlpha: 0.8,
  fill: '0xffffff',
  fontSize: 54,
})

export default function VerseSwitch({ currentVerse }: { currentVerse: VerseId }) {
  const Component = verseMap[currentVerse]
  return (
    <Suspense
      fallback={
        <>
          <Text
            text="Loading..."
            style={style}
            anchor={{ x: 0.5, y: 0.5 }}
            x={OPTIONS.width / 2}
            y={OPTIONS.height / 2}
          />
          <Curtain />
        </>
      }
    >
      <Component />
    </Suspense>
  )
}
