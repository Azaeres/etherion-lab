import dynamic from 'next/dynamic'
import scenes, { SceneId } from '../../components/PixiStage/list'

const PixiStage = dynamic(() => import('src/components/PixiStage'), { ssr: false })
export default function SingletonStage({ params }: { params: { scene: SceneId } }) {
  const { scene } = params
  return <PixiStage scene={scene} />
}

export async function generateStaticParams() {
  return scenes.map((scene) => {
    return {
      scene,
    }
  })
}

// SingletonStage.whyDidYouRender = true
