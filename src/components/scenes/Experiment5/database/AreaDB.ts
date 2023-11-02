import { field, variant } from '@dao-xyz/borsh'
import { Program } from '@peerbit/program'
import { Documents, PutOperation, DeleteOperation } from '@peerbit/document'
import { sha256Sync } from '@peerbit/crypto'
import { concat } from 'uint8arrays'
import { Args } from '.'
import { WorldObject } from './WorldObject'
import type { AreaId } from '../AreaSwitch/list'

@variant('area')
export class AreaDB extends Program<Args> {
  @field({ type: 'string' })
  name: AreaId

  @field({ type: Documents })
  worldObjects: Documents<WorldObject>

  constructor(properties: { name: AreaId; worldObjects?: Documents<WorldObject> }) {
    super()
    this.name = properties.name
    this.worldObjects =
      properties.worldObjects ||
      new Documents({
        id: sha256Sync(
          concat([new TextEncoder().encode('area'), new TextEncoder().encode(this.name)])
        ),
      })
  }

  get id() {
    return this.name
  }

  // Setup lifecycle, will be invoked on 'open'
  async open(args?: Args): Promise<void> {
    await this.worldObjects.open({
      type: WorldObject,
      canPerform: async (operation, context) => {
        if (operation instanceof PutOperation) {
          const post = operation.value
          if (!context.entry.signatures.find((x) => x.publicKey.hashcode() === post!.owner)) {
            return false
          }
          return true
        } else if (operation instanceof DeleteOperation) {
          const get = await this.worldObjects.index.get(operation.key)
          if (!get || !context.entry.signatures.find((x) => x.publicKey.hashcode() === get.owner)) {
            return false
          }
          return true
        }
        return false
      },
      replicas: {
        min: 0xffffffff, // max u32 (make everyone a replicator, disable sharding)
      },
      index: {
        canRead: async () => {
          // identity) => {
          return true // Anyone can query
        },
      },
      role: args?.role,
      sync: args?.sync,
    })
  }
}
