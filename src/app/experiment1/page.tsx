'use client'
import Logo from 'src/components/Logo'
import PixiStage from 'src/components/PixiStage'

export default function Home() {
  return (
    <PixiStage color={0x1044ff}>
      <Logo x={300} />
    </PixiStage>
  )
}
