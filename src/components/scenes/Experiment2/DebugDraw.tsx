import { Graphics } from '@pixi/react'
import * as PIXI from 'pixi.js'
import planck from 'planck'
import { pxFromMeters } from 'src/utils/physics'

const fill = 0x000000
const lineColor = 0xffffff
const lineWidth = 5
const alpha = 0.4

export interface DebugDrawProps {
  body?: planck.Body
}

export default function DebugDraw(props: DebugDrawProps) {
  const { body } = props
  return (
    <Graphics
      draw={(g: PIXI.Graphics) => {
        g.clear()
        g.lineStyle(lineWidth, lineColor)
        g.beginFill(fill, alpha)
        const pixiPolygons = pixiPolygonsFromPhysicsBody(body)
        pixiPolygons.forEach((pixiPolygon) => {
          g.drawPolygon(pixiPolygon)
        })
        g.endFill()
      }}
    />
  )
}

function pixiPolygonsFromPhysicsBody(body?: planck.Body) {
  const pixiPolygons = [] as number[][]
  let currentFixture = body?.getFixtureList()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (currentFixture === undefined || currentFixture === null) {
      break
    }
    const pixiPolygon = pixiPolygonFromFixture(currentFixture)
    pixiPolygons.push(pixiPolygon)
    currentFixture = currentFixture?.getNext()
  }

  return pixiPolygons
}

function pixiPolygonFromFixture(fixture: planck.Fixture) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shape = fixture.getShape() as any
  const vertexList = shape.m_vertices as planck.Vec2[]

  const pixiPolygonArray = [] as number[]
  vertexList.forEach((currentVertex) => {
    const xPx = pxFromMeters(currentVertex.x)
    const yPx = -pxFromMeters(currentVertex.y)
    pixiPolygonArray.push(xPx, yPx)
  })

  return pixiPolygonArray
}
