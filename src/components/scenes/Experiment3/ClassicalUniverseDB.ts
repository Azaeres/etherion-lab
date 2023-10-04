import { field, variant } from '@dao-xyz/borsh'
import { Program } from '@peerbit/program'
import { Documents } from '@peerbit/document'
import { sha256Sync } from '@peerbit/crypto'
import { Role, SyncFilter } from '@peerbit/shared-log'
// import AreaDB from './AreaDB'
import { PublicSignKey } from '@peerbit/crypto'
// import { CollaborationKey } from './hooks/usePeerbitDatabase'
import type { AreaId } from './AreaSwitch/areas'

@variant(0)
export class Peer {
  @field({ type: 'string' })
  id: string

  @field({ type: 'string' })
  area: AreaId

  constructor({ publicKey, area }: { publicKey: PublicSignKey; area: AreaId }) {
    this.id = publicKey.hashcode()
    this.area = area
  }
}

type Args = { role?: Role; sync?: SyncFilter }

@variant('classical-universe')
export class ClassicalUniverseDB extends Program<Args> {
  @field({ type: 'string' })
  id: string

  // @field({ type: PublicSignKey })
  // collaborationKey: PublicSignKey

  @field({ type: Documents })
  peers: Documents<Peer>

  // @field({ type: Documents })
  // areas: Documents<AreaDB>

  constructor(properties: { id: string }) {
    super()
    this.id = properties.id
    // this.id = properties.collaborationKey.hashcode()
    // console.log('classicalUniverseDb > this.id:', this.id)
    // this.collaborationKey = properties.collaborationKey
    this.peers = new Documents({
      id: sha256Sync(new TextEncoder().encode('peers')),
    })
    // this.areas = new Documents<AreaDB>({ id: this.id })
  }

  // Setup lifecycle, will be invoked on 'open'
  async open(args?: Args): Promise<void> {
    await this.peers.open({
      type: Peer,
      canPerform: () => {
        // operation, context) => {
        console.log('PeerDB access control  :')
        return Promise.resolve(true) // Anyone can create peers.
      },
      index: {
        key: 'id',
        canRead: async () => {
          // identity) => {
          return true // Anyone can query
        },
        fields: async (peer) => {
          // , context) => {
          return {
            id: peer.id,
            area: peer.area,
            // keys: (await this.peers.log.log.get(context.head))!.signatures.map((signature) =>
            //   signature.publicKey.hashcode()
            // ),
          }
        },
      },
      role: args?.role,
      sync: args?.sync,
    })
    // await this.areas.open({
    //   type: AreaDB,

    //   canPerform: (/*entry*/) => {
    //     return Promise.resolve(true) // Anyone can create areas
    //   },

    //   index: {
    //     key: 'id',

    //     canRead: (/*post, publicKey*/) => {
    //       return Promise.resolve(true) // Anyone can search for areas.
    //     },
    //   },
    //   canOpen: (/*program*/) => {
    //     // Control whether someone can create an "area", which itself is a program with replication.
    //     // Even if anyone could do "areas.put(new AreaDB())", that new entry has to be analyzed.
    //     // And if it turns out that new entry represents a program
    //     // this means it should be handled in a special way (replication etc).
    //     // This extra functionality requires peers to consider this additional security boundary.
    //     return Promise.resolve(true)
    //   },
    //   role: args?.role,
    //   sync: args?.sync,
    // })
  }
}
