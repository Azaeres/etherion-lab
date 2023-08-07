import dynamic from 'next/dynamic'
import experiments from './experiments'

const PixiStage = dynamic(() => import('src/components/PixiStage'), { ssr: false })

export default function SingletonStage({ params }: { params: { experiment: string } }) {
  const { experiment } = params
  return (
    <div id="root">
      <PixiStage experiment={experiment}></PixiStage>
    </div>
  )
}

export async function generateStaticParams() {
  return experiments.map((experiment) => ({
    experiment,
  }))
}
