import { field, variant } from '@dao-xyz/borsh'
import { Program } from '@peerbit/program'
// import { SearchRequest, Documents, StringMatch } from '@peerbit/document'
import { Role, SyncFilter } from '@peerbit/shared-log'
import { sha256Sync } from '@peerbit/crypto'
import { Documents } from '@peerbit/document'
import { ClassicalUniverseDB } from './ClassicalUniverseDB'

type Args = { role?: Role; sync?: SyncFilter }

// A random ID, but unique for this app
const ID = new Uint8Array([
  30, 222, 227, 76, 76, 146, 158, 61, 8, 21, 176, 122, 5, 164, 10, 255, 233, 253, 92, 79, 110, 115,
  46, 212, 14, 162, 30, 94, 1, 134, 99, 174,
])

@variant('universe')
export default class UniverseDB extends Program<Args> {
  @field({ type: Uint8Array })
  id: Uint8Array

  @field({ type: Documents })
  classicalUniverses: Documents<ClassicalUniverseDB>

  constructor(properties: { id: Uint8Array } = { id: ID }) {
    super()
    this.id = properties.id
    this.classicalUniverses = new Documents({
      id: sha256Sync(new TextEncoder().encode('classical-universes')),
    })
  }

  // Setup lifecycle, will be invoked on 'open'
  async open(args?: Args): Promise<void> {
    await this.classicalUniverses.open({
      type: ClassicalUniverseDB,
      canPerform: () => {
        // operation, context) => {
        return Promise.resolve(true) // Anyone can create classical universes.
      },
      canOpen: () => {
        // program) => {
        // Control whether someone can create a "classical universe", which itself is a program with replication.
        // Even if anyone could do "areas.put(new AreaDB())", that new entry has to be analyzed.
        // And if it turns out that new entry represents a program
        // this means it should be handled in a special way (replication etc).
        // This extra functionality requires peers to consider this additional security boundary.
        return Promise.resolve(true)
      },
      index: {
        key: 'id',
        canRead: async () => {
          // identity) => {
          return true // Anyone can query
        },
        fields: async (classicalUniverseDb) => {
          // , context) => {
          return {
            id: classicalUniverseDb.id,
            // area: classicalUniverseDb.area,
            // keys: (await this.peers.log.log.get(context.head))!.signatures.map((signature) =>
            //   signature.publicKey.hashcode()
            // ),
          }
        },
      },
      role: args?.role,
      sync: args?.sync,
    })
  }

  // async getName(key: PublicSignKey): Promise<Peer | undefined> {
  //   const results = await this.peers.index.search(
  //     new SearchRequest({
  //       query: [new StringMatch({ key: 'keys', value: key.hashcode() })],
  //     })
  //   )
  //   return results[0]
  // }
}
