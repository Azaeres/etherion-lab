'use client'
import { Container, Stage, withFilters } from '@pixi/react'
import { PropsWithChildren, useCallback } from 'react'
import Logo from 'src/components/Logo'
import { useRouter } from 'next/navigation'
import { PixelateFilter } from '@pixi/filter-pixelate'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context'

export const OPTIONS = {
  width: 2592,
  height: 1080,
  // antialias: true, // Causing a crash on mobile
  hello: true,
  // backgroundColor: 0x000000,
}

interface Props {
  experiment: string
}

// color={0x10bb99}

export default function PixiStage({ experiment }: PropsWithChildren<Props>) {
  const router = useRouter()
  const Filters = withFilters(Container, {
    pixelate: PixelateFilter,
  })
  return (
    <Stage width={OPTIONS.width} height={OPTIONS.height} options={OPTIONS}>
      <Filters pixelate={{ size: 4 }}>
        <Experiment experiment={experiment} router={router} />
      </Filters>
    </Stage>
  )
}

function Experiment({ experiment, router }: { experiment: string; router: AppRouterInstance }) {
  // const homeNav = useNavigateCallback('/')
  const exp2cb = useCallback(() => router.push('experiment2'), [router])
  const exp1cb = useCallback(() => router.push('experiment1'), [router])
  if (experiment === 'experiment1') {
    return <Logo x={200} y={100} onpointerup={exp2cb} cursor="pointer" interactive />
  } else if (experiment === 'experiment2') {
    return <Logo x={200} y={400} onpointerup={exp1cb} cursor="pointer" interactive />
  }
}
