import { field, variant } from '@dao-xyz/borsh'
import { Program } from '@peerbit/program'
import { Documents, PutOperation, DeleteOperation } from '@peerbit/document'
import { v4 as uuid } from 'uuid'
import { PublicSignKey, sha256Sync } from '@peerbit/crypto'
import { concat } from 'uint8arrays'
import { Args } from '.'
import { AreaDB } from './AreaDB'

@variant(0) // for versioning purposes, we can do @variant(1) when we create a new post type version
export class Post {
  @field({ type: 'string' })
  id: string

  @field({ type: PublicSignKey })
  from: PublicSignKey

  @field({ type: 'string' })
  message: string

  constructor(properties: { from: PublicSignKey; message: string }) {
    this.id = uuid()
    this.from = properties.from
    this.message = properties.message
  }
}

@variant('space')
export class SpaceDB extends Program<Args> {
  @field({ type: 'string' })
  name: string

  @field({ type: Documents })
  messages: Documents<Post>

  @field({ type: Documents })
  areas: Documents<AreaDB>

  constructor(properties: { name: string; messages?: Documents<Post>; areas?: Documents<AreaDB> }) {
    super()
    this.name = properties.name
    this.messages =
      properties.messages ||
      new Documents({
        id: sha256Sync(
          concat([new TextEncoder().encode('space-messages'), new TextEncoder().encode(this.name)])
        ),
      })
    this.areas =
      properties.areas ||
      new Documents({
        id: sha256Sync(
          concat([new TextEncoder().encode('space-areas'), new TextEncoder().encode(this.name)])
        ),
      })
  }

  get id() {
    return this.name
  }

  // Setup lifecycle, will be invoked on 'open'
  async open(args?: Args): Promise<void> {
    await this.areas.open({
      type: AreaDB,
      canPerform: async () => {
        //operation, context) => {
        return Promise.resolve(true) // Anyone can create areas
      },
      canOpen: () => {
        // program) => {
        // Control whether someone can create a "space", which itself is a program with replication
        // Even if anyone could do "spaces.put(new SpaceDB())", that new entry has to be analyzed. And if it turns out that new entry represents a program
        // this means it should be handled in a special way (replication etc). This extra functionality needs requires peers to consider this additional security
        // boundary
        return Promise.resolve(true)
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

    await this.messages.open({
      type: Post,
      canPerform: async (operation, context) => {
        if (operation instanceof PutOperation) {
          const post = operation.value
          if (!context.entry.signatures.find((x) => x.publicKey.equals(post!.from))) {
            return false
          }
          return true
        } else if (operation instanceof DeleteOperation) {
          const get = await this.messages.index.get(operation.key)
          if (!get || !context.entry.signatures.find((x) => x.publicKey.equals(get.from))) {
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
