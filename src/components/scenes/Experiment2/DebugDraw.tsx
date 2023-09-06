import { Graphics } from '@pixi/react'
import { Graphics as PixiGraphics } from 'pixi.js'
import { Body, Fixture } from 'planck'
import { Pixels, Vec2Meters, pxFromMeters } from 'src/utils/physics'

const fill = 0x000000
const lineColor = 0xffffff
const lineWidth = 5
const alpha = 0.4

export interface DebugDrawProps {
  body?: Body
}

export default function DebugDraw(props: DebugDrawProps) {
  const { body } = props
  return (
    <Graphics
      draw={(g: PixiGraphics) => {
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

function pixiPolygonsFromPhysicsBody(body?: Body) {
  const pixiPolygons = [] as Pixels[][]
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

function pixiPolygonFromFixture(fixture: Fixture) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shape = fixture.getShape() as any
  const vertexList = shape.m_vertices as Vec2Meters[]

  const pixiPolygonArray = [] as Pixels[]
  vertexList.forEach((currentVertex) => {
    const xPx = pxFromMeters(currentVertex.x)
    const yPx = -pxFromMeters(currentVertex.y) as Pixels
    pixiPolygonArray.push(xPx, yPx)
  })

  return pixiPolygonArray
}
