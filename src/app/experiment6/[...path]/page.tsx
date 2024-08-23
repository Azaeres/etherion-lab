import { verseMap } from '../list'
import ClientRouter from '../ClientRouter'

export default function SingletonStage(/*{ params }: { params: { path: string[] } }*/) {
  return <ClientRouter />
}

export async function generateStaticParams() {
  return Object.keys(verseMap).map((path) => ({
    path: path.split('/'),
  }))
}

// SingletonStage.whyDidYouRender = true
