import { TextStyle } from 'pixi.js'

export const styles = {
  body: new TextStyle({
    fill: '0xcccccc',
    fontSize: '48px',
    dropShadow: true,
    dropShadowAlpha: 0.8,
  }),
  darkBody: new TextStyle({ fill: '0x555555', fontSize: '48px' }),
  smallBody: new TextStyle({
    dropShadow: true,
    dropShadowAlpha: 0.8,
    fill: '0xcccccc',
    fontSize: 38,
    fontFamily: 'Arial',
    fontWeight: 'bold',
  }),
} as const
