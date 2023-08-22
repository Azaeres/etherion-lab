import Link from 'next/link'
import scenes from './[scene]/scenes'
import app from './app.module.css'

export default function Home() {
  return (
    <div className={app.page}>
      <h1>Etherion Laboratory</h1>
      <h3>Experiments:</h3>
      <ul>
        {scenes.map((sceneId) => {
          return (
            <li key={sceneId}>
              <Link href={`/${sceneId}`}>
                <button className={app['button-64']}>
                  <span className={app.text}>{sceneId}</span>
                </button>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
