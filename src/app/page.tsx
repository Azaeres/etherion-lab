import Link from 'next/link'
import scenes, { sceneMeta } from '../components/PixiStage/list'
import app from './app.module.css'

export default function Home() {
  return (
    <div className={app.page}>
      <h1>Etherion Laboratory</h1>
      <h3>Experiments:</h3>
      <ul>
        {scenes.map((sceneId, index) => {
          const href =
            sceneId === 'experiment3'
              ? `/${sceneId}?u=uAE4t0QkLRPnW_-WEPqwMej8dRio3Tivy41iD7pCnwCRS`
              : `/${sceneId}`
          const { title, description } = sceneMeta[sceneId]
          return (
            <li key={sceneId} style={{ textAlign: 'left' }}>
              <Link href={href}>
                <button className={app['button-64']}>
                  <span className={app.text}>
                    {index + 1}. {title}
                  </span>
                </button>
              </Link>
              <span className={app['description']}>{description}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
