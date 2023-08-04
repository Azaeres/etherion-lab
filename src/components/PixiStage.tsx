'use client'
import { Stage } from '@pixi/react'
import { IApplicationOptions } from 'pixi.js'
import { PropsWithChildren, memo } from 'react'

export const OPTIONS = {
  width: 2592,
  height: 1080,
  antialias: true,
  hello: true,
  backgroundColor: 0x000000,
}

interface Props {
  color?: number
}

function PixiStage({ color, children }: PropsWithChildren<Props>) {
  const _options: Partial<IApplicationOptions> = { ...OPTIONS, backgroundColor: color }
  console.log('PixiStage  > _options:', _options)
  return (
    <Stage width={OPTIONS.width} height={OPTIONS.height} options={_options}>
      {children}
    </Stage>
  )
}

export default memo(PixiStage)
