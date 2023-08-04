'use client'
import PixiStage from 'src/components/PixiStage'
import Logo from 'src/components/Logo'
import useNavigateCallback from './hooks/useNavigateCallback'

export default function Home() {
  return (
    <PixiStage color={0x10bb99}>
      <Logo
        x={200}
        onpointerup={useNavigateCallback('/experiment1')}
        cursor="pointer"
        interactive
      />
    </PixiStage>
  )
}
