import { Vec2 } from 'planck'
import { Nominal } from 'src/types/Nominal'

export type Meters = Nominal<number, 'Meters'>
export type Pixels = Nominal<number, 'Pixels'>

export interface Vec2Meters extends Vec2 {
  x: Meters
  y: Meters
}
export interface Vec2Pixels extends Vec2 {
  x: Pixels
  y: Pixels
}

export function metersFromPx(px: Pixels): Meters {
  return (px / 100) as Meters
}

export function pxFromMeters(meters: Meters): Pixels {
  return (meters * 100) as Pixels
}
