'use client'
import Link from 'next/link'
import experiments from './[experiment]/experiments'
import app from './app.module.css'

export default function Welcome() {
  return (
    <div className={app.page}>
      <h1>Etherion Laboratory</h1>
      <h3>Experiments:</h3>
      <ul>
        {experiments.map((experiment) => {
          return (
            <li key={experiment}>
              <Link href={`/${experiment}`}>
                <button className={app['button-64']}>
                  <span className={app.text}>{experiment}</span>
                </button>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
