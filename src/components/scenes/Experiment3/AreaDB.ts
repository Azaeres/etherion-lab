import { field, variant } from '@dao-xyz/borsh'
import { Program } from '@peerbit/program'
import {
  Documents,
  PutOperation,
  DeleteOperation,
  IntegerCompare,
  SortDirection,
  SearchRequest,
  Sort,
  Compare,
  Query,
} from '@peerbit/document'
import { v4 as uuid } from 'uuid'
import { PublicSignKey, sha256Sync, Ed25519PublicKey } from '@peerbit/crypto'
import { Role, SyncFilter } from '@peerbit/shared-log'
import { concat } from 'uint8arrays'
import type { PeerId } from './hooks/usePeerbitDatabase'
import type { Meters } from 'src/utils/physics'
import type { AreaId } from './AreaSwitch/areas'

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
const TIMESTAMP = 'timestamp'

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

type Args = {
  role?: Role
  sync?: SyncFilter
}

@variant('area')
export default class AreaDB extends Program<Args> {
  @field({ type: PublicSignKey })
  creator: PublicSignKey | Ed25519PublicKey

  @field({ type: Documents })
  worldObjects: Documents<WorldObject>

  @field({ type: 'string' })
  areaId: AreaId

  constructor(properties: {
    areaId: AreaId
    creator: PublicSignKey | Ed25519PublicKey
    worldObjects?: Documents<WorldObject>
  }) {
    super()
    this.areaId = properties.areaId
    this.creator = properties.creator
    this.worldObjects =
      properties.worldObjects ||
      new Documents<WorldObject>({
        id: sha256Sync(concat([new TextEncoder().encode('area-worldobjects'), this.creator.bytes])),
      })
  }

  get id() {
    return this.creator.hashcode()
  }

  // Setup lifecycle, will be invoked on 'open'
  async open(args?: Args): Promise<void> {
    await this.worldObjects.open({
      type: WorldObject,
      canPerform: async (operation, { entry }) => {
        console.log('canPerform  > operation:', operation)
        if (operation instanceof PutOperation) {
          const worldObject = operation.value
          console.log('PutOperation  > worldObject, entry:', worldObject, entry)
          if (
            !entry.signatures.find((signature) => signature.publicKey.equals(worldObject!.owner))
          ) {
            return false
          }
          return true
        } else if (operation instanceof DeleteOperation) {
          const get = await this.worldObjects.index.get(operation.key)
          console.log('DeleteOperation > get, entry:', get, entry)
          if (
            !get ||
            !entry.signatures.find((signature) => signature.publicKey.equals(get.owner))
          ) {
            return false
          }
          return true
        }
        return false
      },

      index: {
        fields: (obj, context) => {
          return {
            [OWNER]: obj[OWNER].bytes,
            [POSITION_X]: obj[POSITION_X],
            [POSITION_Y]: obj[POSITION_Y],
            [TIMESTAMP]: context.created,
          }
        },
        canRead: async (/* document, publicKey */) => {
          return true // Anyone can query
        },
      },
      role: args?.role,
      sync: args?.sync,
    })
  }

  async getTimestamp(id: string) {
    const docs = await this.worldObjects.index.getDetailed(id, {
      local: true,
    })
    return docs?.[0]?.results[0]?.context.created
  }

  public async loadEarlier() {
    // get the earliest doc locally, query all docs earlier than this
    const firstIterator = await this.worldObjects.index.iterate(
      new SearchRequest({
        query: [],
        sort: [
          new Sort({
            direction: SortDirection.ASC,
            key: TIMESTAMP,
          }),
        ],
      }),
      {
        local: true,
        remote: false,
      }
    )
    const earliestWorldObject = (await firstIterator.next(1))[0]
    firstIterator.close()

    const query: Query[] = []
    if (earliestWorldObject) {
      const detailedWO = await this.worldObjects.index.getDetailed(earliestWorldObject.id, {
        local: true,
      })
      const created = detailedWO?.[0]?.results[0]?.context.created
      if (created != null) {
        query.push(
          new IntegerCompare({
            key: 'timestmap',
            compare: Compare.Less,
            value: created,
          })
        )
      }
    }
    const iterator = await this.worldObjects.index.iterate(
      new SearchRequest({
        query,
        sort: [
          new Sort({
            direction: SortDirection.ASC,
            key: TIMESTAMP,
          }),
        ],
      }),
      {
        remote: {
          sync: true,
        },
        local: true,
      }
    )
    const next = await iterator.next(10)
    iterator.close()
    return next
  }

  public async loadLater(than?: bigint) {
    // get the earliest doc locally, query all docs earlier than this

    const query: Query[] = []

    if (than == null) {
      const lastIterator = await this.worldObjects.index.iterate(
        new SearchRequest({
          query: [],
          sort: [
            new Sort({
              direction: SortDirection.DESC,
              key: TIMESTAMP,
            }),
          ],
        }),
        {
          local: true, // we only query locally too see what we don't have
          remote: false,
        }
      )

      const latestPost = (await lastIterator.next(1))[0]
      lastIterator.close()

      if (latestPost) {
        const created = await this.getTimestamp(latestPost.id)
        if (created != null) {
          query.push(
            new IntegerCompare({
              key: TIMESTAMP,
              compare: Compare.Greater,
              value: created,
            })
          )
        }
      }
    } else {
      query.push(
        new IntegerCompare({
          key: TIMESTAMP,
          compare: Compare.Greater,
          value: than,
        })
      )
    }

    const iterator = await this.worldObjects.index.iterate(
      new SearchRequest({
        query,
        sort: [
          new Sort({
            direction: SortDirection.ASC,
            key: TIMESTAMP,
          }),
        ],
      }),
      {
        remote: {
          sync: true,
        },
        local: true,
      }
    )
    const next = await iterator.next(10)
    iterator.close()
    return next
  }
}
