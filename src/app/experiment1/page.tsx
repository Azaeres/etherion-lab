'use client'
import Logo from 'src/components/Logo'
import PixiStage from 'src/components/PixiStage'
import { useNavigateCallback } from '../page'

export default function Home() {
  return (
    <PixiStage color={0x1044ff}>
      <Logo x={400} onpointerup={useNavigateCallback('/')} cursor="pointer" interactive />
    </PixiStage>
  )
}
