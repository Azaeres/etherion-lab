import { field, variant } from '@dao-xyz/borsh'
import { Program } from '@peerbit/program'
import { Documents } from '@peerbit/document'
import { randomBytes } from '@peerbit/crypto'
import { Args } from '.'
import { SpaceDB } from './SpaceDB'

@variant('universe')
export class UniverseDB extends Program<Args> {
  @field({ type: Uint8Array })
  id: Uint8Array

  @field({ type: Documents })
  spaces: Documents<SpaceDB>

  constructor(properties: { id?: Uint8Array }) {
    super()
    this.id = properties.id || randomBytes(32)
    this.spaces = new Documents<SpaceDB>({ id: this.id })
  }

  // Setup lifecycle, will be invoked on 'open'
  async open(args?: Args): Promise<void> {
    await this.spaces.open({
      type: SpaceDB,

      canPerform: () => {
        //entry) => {
        return Promise.resolve(true) // Anyone can create spaces
      },

      replicas: {
        min: 0xffffffff, // max u32 (make everyone a replicator, disable sharding)
      },
      index: {
        key: 'name',

        canRead: () => {
          // post, publicKey) => {
          return Promise.resolve(true) // Anyone can search for spaces
        },
      },
      canOpen: () => {
        // program) => {
        // Control whether someone can create a "space", which itself is a program with replication
        // Even if anyone could do "spaces.put(new SpaceDB())", that new entry has to be analyzed. And if it turns out that new entry represents a program
        // this means it should be handled in a special way (replication etc). This extra functionality needs requires peers to consider this additional security
        // boundary
        return Promise.resolve(true)
      },
      role: args?.role,
      sync: args?.sync,
    })
  }
}
