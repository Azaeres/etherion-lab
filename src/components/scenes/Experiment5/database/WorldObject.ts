import { field, variant } from '@dao-xyz/borsh'
import { v4 as uuid } from 'uuid'
import { PublicSignKey } from '@peerbit/crypto'
import type { Meters } from 'src/utils/physics'
import type { AreaId } from '../AreaSwitch/list'
import type { PeerId } from '.'
import type { WorldObjectComponentId } from '../world-objects/ManifestationBoundary/list'
import { Nominal } from 'src/types/Nominal'

const UPSTREAM_PEER = 'upstream_peer'
const AREA = 'area'
const ORPHAN = 'orphan'
const POSITION_X = 'pos_x'
const POSITION_Y = 'pos_y'
const POSITION_Z = 'pos_z'
const VELOCITY_X = 'vel_x'
const VELOCITY_Y = 'vel_y'
const ACCEL_X = 'acc_x'
const ACCEL_Y = 'acc_y'
const ROTATION = 'rotation'
const SCALE = 'scale'
// const TIMESTAMP = 'timestamp'

export type WorldObjectId = Nominal<string, 'WorldObjectId'>

interface WorldObjectModelWithoutData {
  id: WorldObjectId
  component: WorldObjectComponentId
  area: AreaId
  upstream_peer: PeerId
  orphan: boolean
  pos_x: Meters
  pos_y: Meters
  pos_z: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  vel_x?: Meters
  vel_y?: Meters
  acc_x?: Meters
  acc_y?: Meters
  rotation?: number
  scale?: number
}

interface WorldObjectModelWithData<DataType extends object> extends WorldObjectModelWithoutData {
  data: DataType
}

export type WorldObjectModel<DataType extends object | void = void> = DataType extends object
  ? WorldObjectModelWithData<DataType>
  : WorldObjectModelWithoutData

// For information on Borsh type mappings, see:
// https://github.com/dao-xyz/borsh-ts#type-mappings

interface WorldObjectPropsWithoutData extends WorldObjectModel {
  data: object
  unmanifest: () => void
  transferOccupancyToWorldObject?: (worldObjectId: WorldObjectId) => void
  cameraPositionX?: Meters
  cameraPositionY?: Meters
  cameraVelocityX?: Meters
  cameraVelocityY?: Meters
}

interface WorldObjectPropsWithData<DataType extends object> extends WorldObjectPropsWithoutData {
  data: DataType
}

export type WorldObjectProps<DataType extends object | void = void> = DataType extends object
  ? WorldObjectPropsWithData<DataType>
  : WorldObjectPropsWithoutData

export type WorldObjectManifest = {
  worldObjectModel: WorldObjectModel
  unmanifest: () => void
  transferOccupancyToWorldObject?: (worldObjectId: WorldObjectId) => void
}
export type DepthStructuredCollection = {
  [zIndex: string]: WorldObjectModel[]
}
export type DepthStructuredManifests = {
  [zIndex: string]: WorldObjectManifest[]
}

// export type WorldObjectCollectionManifest = [DepthStructuredCollection, (id: string) => void]

@variant(0) // for versioning purposes, we can do @variant(1) when we create a new post type version
export class WorldObject implements WorldObjectModel {
  @field({ type: 'string' })
  id: WorldObjectId

  @field({ type: 'string' })
  component: WorldObjectComponentId;

  @field({ type: 'string' })
  [AREA]: AreaId;

  @field({ type: PublicSignKey })
  [UPSTREAM_PEER]: PeerId;

  @field({ type: 'bool' })
  [ORPHAN]: boolean;

  @field({ type: 'f64' })
  [POSITION_X]: Meters;

  @field({ type: 'f64' })
  [POSITION_Y]: Meters;

  @field({ type: 'f64' })
  [POSITION_Z]: number;

  @field({ type: 'f64' })
  [VELOCITY_X]: Meters;

  @field({ type: 'f64' })
  [VELOCITY_Y]: Meters;

  @field({ type: 'f64' })
  [ACCEL_X]: Meters;

  @field({ type: 'f64' })
  [ACCEL_Y]: Meters;

  @field({ type: 'f64' })
  [ROTATION]: number;

  @field({ type: 'f64' })
  [SCALE]: number

  @field({ type: 'string' })
  private _data!: string

  constructor(properties: WorldObjectModel) {
    const {
      id = uuid() as WorldObjectId,
      component,
      data = {},
      area,
      upstream_peer: upstreamPeer,
      orphan,
      pos_x,
      pos_y,
      pos_z,
      vel_x = 0.0 as Meters,
      vel_y = 0.0 as Meters,
      acc_x = 0.0 as Meters,
      acc_y = 0.0 as Meters,
      rotation = 0.0,
      scale = 1.0,
    } = properties
    this.id = id
    this.component = component
    this.area = area
    this.upstream_peer = upstreamPeer
    this.orphan = orphan
    this.pos_x = pos_x
    this.pos_y = pos_y
    this.pos_z = pos_z
    this.vel_x = vel_x
    this.vel_y = vel_y
    this.acc_x = acc_x
    this.acc_y = acc_y
    this.rotation = rotation
    this.scale = scale
    this.data = data as object
  }

  public get data(): object {
    try {
      return JSON.parse(this._data)
    } catch (error) {
      console.error('Error decoding world object data: ', error)
      return {}
    }
  }
  public set data(d: object) {
    try {
      this._data = JSON.stringify(d)
    } catch (error) {
      console.error('Error encoding world object data: ', error)
    }
  }
}
