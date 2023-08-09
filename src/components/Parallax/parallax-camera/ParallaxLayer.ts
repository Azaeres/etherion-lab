import { Container } from 'pixi.js'

export default class ParallaxLayer extends Container {
  public px: number = 0
  public py: number = 0
  public pz: number = 0

  constructor(z: number = 0) {
    super()
    this.pz = z
  }
}
