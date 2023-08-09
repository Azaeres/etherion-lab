'use client'
import useNextjsNavigate from 'src/app/hooks/useNextjsNavigate'
import Logo from 'src/components/Logo'

export default function Experiment1() {
  const navigate = useNextjsNavigate()
  return (
    <>
      <Logo x={200} y={100} onpointerup={navigate('experiment2')} cursor="pointer" interactive />
    </>
  )
}
