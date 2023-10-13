import { field, variant } from '@dao-xyz/borsh'
import { v4 as uuid } from 'uuid'
import { PublicSignKey } from '@peerbit/crypto'
import type { Meters } from 'src/utils/physics'
import type { AreaId } from '../AreaSwitch/areas'
import type { PeerId } from '.'

const OWNER = 'owner'
const AREA = 'area'
const ORPHAN = 'orphan'
const POSITION_X = 'pos_x'
const POSITION_Y = 'pos_y'
const VELOCITY_X = 'vel_x'
const VELOCITY_Y = 'vel_y'
const ACCEL_X = 'acc_x'
const ACCEL_Y = 'acc_y'
const ROTATION = 'rotation'
const SCALE = 'scale'
// const TIMESTAMP = 'timestamp'

export interface WorldObjectConfig {
  area: AreaId
  owner: PeerId
  orphan: boolean
  pos_x: Meters
  pos_y: Meters
  vel_x?: Meters
  vel_y?: Meters
  acc_x?: Meters
  acc_y?: Meters
  rotation: number
  scale: number
}

// For information on Borsh type mappings, see:
// https://github.com/dao-xyz/borsh-ts#type-mappings

interface WorldObjectModel extends WorldObjectConfig {
  id: string
  component: string
}

@variant(0) // for versioning purposes, we can do @variant(1) when we create a new post type version
export class WorldObject implements WorldObjectModel {
  @field({ type: 'string' })
  id: string

  @field({ type: 'string' })
  component: string;

  @field({ type: 'string' })
  [AREA]: AreaId;

  @field({ type: PublicSignKey })
  [OWNER]: PeerId;

  @field({ type: 'bool' })
  [ORPHAN]: boolean;

  @field({ type: 'f64' })
  [POSITION_X]: Meters;

  @field({ type: 'f64' })
  [POSITION_Y]: Meters;

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

  constructor(properties: {
    component: string
    area: AreaId
    owner: PeerId
    orphan: boolean
    p_x: Meters
    p_y: Meters
    v_x: Meters
    v_y: Meters
    a_x: Meters
    a_y: Meters
    rot: number
    scale: number
  }) {
    this.id = uuid()
    this.component = properties.component
    this.area = properties.area
    this.owner = properties.owner
    this.orphan = properties.orphan
    this.pos_x = properties.p_x
    this.pos_y = properties.p_y
    this.vel_x = properties.v_x
    this.vel_y = properties.v_y
    this.acc_x = properties.a_x
    this.acc_y = properties.a_y
    this.rotation = properties.rot
    this.scale = properties.scale
  }
}
