import PIXI from 'pixi.js'
import ParallaxLayer from './ParallaxLayer'

export class ParallaxCamera {
  public bounds?: PIXI.Rectangle
  public x: number = 0
  public y: number = 0
  public layers: ParallaxLayer[] = []

  protected _baseZoom: number = 1
  protected _zoom: number = 1
  protected _target?: PIXI.DisplayObject

  protected _shakeEndTime: number = 0
  protected _shakeStrength: number = 0

  constructor(
    protected _view: PIXI.ICanvas,
    public renderer: PIXI.IRenderer,
    public baseContainer?: PIXI.Container,
    // The `focalLength` is the zIndex distance of the camera from the baseContainer.
    // This gives us parallax space to work with.
    public focalLength: number = 300,
    public movementDamping: number = 10
  ) {
    if (baseContainer) {
      baseContainer.name = 'ParallaxCameraBaseContainer'
    }
  }

  // *********************************************************************************************
  // * Public																					   *
  // *********************************************************************************************
  public update() {
    if (!this.baseContainer) return

    // let sw = this.renderer.width * 0.5;
    // let sh = this.renderer.height * 0.5;
    let shakeX = 0
    let shakeY = 0

    // This block aligns the camera zoom origin to the target origin.
    const target = this._target
    if (this && target) {
      // const targetBounds = target.getBounds();
      if (this.movementDamping === 0) {
        // this.x = -target.x;
        // this.y = -target.y;

        // this.x += -this.x - target.x;
        // this.y += -this.y - target.y;
        this.x += -this.x - target.x
        this.y += -this.y - target.y
      } else {
        this.x += (-this.x - target.x) / this.movementDamping
        this.y += (-this.y - target.y) / this.movementDamping

        // this.x += ((-this.x - target.x) / this.movementDamping) + 10;
        // this.y += ((-this.y - target.y) / this.movementDamping) + 10;
      }
    }

    // This block factors in a shaking effect.
    const shakeStrength = this._shakeStrength
    if (shakeStrength) {
      const t = Date.now()
      if (t > this._shakeEndTime) {
        this._shakeStrength = 0
      } else {
        shakeX = this.randomFloat(-shakeStrength, shakeStrength)
        shakeY = this.randomFloat(-shakeStrength, shakeStrength)
      }
    }

    // This block enforces camera roaming boundaries.
    const bounds = this.bounds
    if (bounds) {
      const zoom = this.zoom
      if (this.x <= -bounds.width * zoom) this.x = -bounds.width * zoom
      else if (this.x >= -bounds.x * zoom) this.x = -bounds.x * zoom

      if (this.y <= -bounds.height * zoom) this.y = -bounds.height * zoom
      else if (this.y >= -bounds.y * zoom) this.y = -bounds.y * zoom
    }

    // This block handles the positions and scaling of the parallax layers.
    let n = (this.layers && this.layers.length) || 0
    while (--n > -1) {
      const layer = this.layers[n]
      const d = this.focalLength / (this.focalLength - layer.pz)
      layer.x = (layer.px + this.x + shakeX) * d
      layer.y = (layer.py + this.y + shakeY) * d
      layer.scale.set(d, d)
    }

    // This block scales the camera's panning to the scale of the parallax parent.
    // let tx = 0,
    //   ty = 0;
    // // let targetBoundsX = 0,
    // //   targetBoundsY = 0;
    // if (target) {
    //   let p = this.getParallaxParent(target.parent);
    //   // console.log(' > p:', p)
    //   if (p) {
    //     // console.log(' > p.scale.x, p.scale.y:', p.scale.x, p.scale.y)
    //     tx = p.x / p.scale.x;
    //     ty = p.y / p.scale.y;
    //   }
    //   // const bounds = target.getBounds();
    //   // targetBoundsX = (bounds.width);
    //   // targetBoundsY = (bounds.height);
    // }

    // console.log(' > this.renderer:', this.renderer)

    // console.log(' > this.baseContainer:', this.baseContainer)
    // console.log(' > tx, ty:', tx, ty)

    // This moves the camera/target zoom origin to the center of the target area.
    // const cameraOffsetX = this.renderer.width + 160;
    // const cameraOffsetY = this.renderer.height - 60;
    // this.baseContainer.x = this.x - tx + sw + shakeX + cameraOffsetX; //+ targetBoundsX ;
    // this.baseContainer.y = this.y - ty + sh + shakeY + cameraOffsetY; //+ targetBoundsY;

    // console.log(' > this.target?.position.x:', this.target?.position.x)
    // console.log(' > this.baseContainer.width:', this.baseContainer.width)

    this.baseContainer.x = this._view.width / 2
    this.baseContainer.y = this._view.height / 2

    // this.baseContainer.x = this.x - tx + shakeX; //+ targetBoundsX ;
    // this.baseContainer.y = this.y - ty + shakeY; //+ targetBoundsY;
    // this.baseContainer.x = this.x + (this.renderer.width * 1.304) - targetBoundsX;
    // this.baseContainer.y = this.y + (this.renderer.height * 1.304) - targetBoundsY;
  }

  public addLayer(layer: ParallaxLayer) {
    // const firstChild = layer.children[0];
    // console.log('\naddLayer  > layer:', firstChild.name, layer.zIndex);
    if (layer['pz'] == null) throw Error('Add Layer: Layers need to be a ParallaxLayer.')

    if (this.layers.indexOf(layer) === -1) {
      // The layer hasn't been added yet.
      this.layers.push(layer)
      this.baseContainer && this.baseContainer.addChild(layer)
      this.zsort()
    }
  }

  public removeLayer(layer: ParallaxLayer) {
    const index = this.layers.indexOf(layer)
    if (index !== -1) this.layers.splice(index, 1)
    if (layer.parent === this.baseContainer) this.baseContainer.removeChild(layer)
  }

  public shake(strength: number, duration: number = 1.0): void {
    this._shakeStrength = strength
    this._shakeEndTime = Date.now() + duration * 1000
  }

  public stopShake() {
    this._shakeStrength = 0
  }

  public setTarget(target?: PIXI.DisplayObject, reposition: boolean = true) {
    this._target = target
    if (target && reposition) {
      this.x = -target.x
      this.y = -target.y
    }
  }

  public zsort() {
    // console.log(
    //   '\nzsort  > this.layers:',
    //   [...this.layers].map(
    //     (layer) => `${layer.children[0].name}: ${layer.zIndex}`
    //   )
    // );
    this.layers = this.layers.sort((a: ParallaxLayer, b: ParallaxLayer) => a.pz - b.pz)
    // console.log(
    //   'sorted layers  > [...this.layers]:',
    //   [...this.layers].map(
    //     (layer) => `${layer.children[0].name}: ${layer.zIndex}`
    //   )
    // );
    this.baseContainer?.children.sort(
      (a: PIXI.DisplayObject, b: PIXI.DisplayObject) => a.zIndex - b.zIndex
    )
    // console.log(' > this.baseContainer?.children:', this.baseContainer?.children)
    // Old version didn't account for non-parallax layers added to the base container.
    // for (let i = 0; i < this.layers.length; ++i) {
    //   this.baseContainer && this.baseContainer.addChildAt(this.layers[i], i);
    // }
  }

  public dispose() {
    this.layers = []
    this._target = undefined
    this.baseContainer && this.baseContainer.removeChildren()
    this.baseContainer = undefined
  }

  public get target(): PIXI.DisplayObject | void {
    return this._target
  }

  public get baseZoom(): number {
    return this._baseZoom
  }

  public set baseZoom(value: number) {
    this._baseZoom = value
    this.baseContainer &&
      this.baseContainer.scale.set(this._zoom * this._baseZoom, this._zoom * this._baseZoom)
  }

  public get zoom(): number {
    return this._zoom
  }

  public set zoom(value: number) {
    console.log('zoom!  > value:', value)
    this._zoom = value
    this.baseContainer &&
      this.baseContainer.scale.set(this._zoom * this._baseZoom, this._zoom * this._baseZoom)
  }

  // *********************************************************************************************
  // * Protected																				   *
  // *********************************************************************************************
  // protected getParallaxParent(p: PIXI.Container): ParallaxLayer | void {
  //   if (p == null) return;
  //   if ("pz" in p) return p as ParallaxLayer;
  //   return this.getParallaxParent(p.parent);
  // }

  protected randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }
}
