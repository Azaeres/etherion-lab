// import dynamic from 'next/dynamic'
import PixiStage from 'src/components/PixiStage'
import scenes, { SceneId } from './scenes'

// const PixiStage = dynamic(() => import('src/components/PixiStage'), { ssr: false })
export default function SingletonStage({ params }: { params: { scene: string } }) {
  const { scene } = params
  return (
    <div id="root">
      <PixiStage scene={scene as SceneId}></PixiStage>
    </div>
  )
}

export async function generateStaticParams() {
  return scenes.map((scene) => ({
    scene,
  }))
}

// SingletonStage.whyDidYouRender = true
