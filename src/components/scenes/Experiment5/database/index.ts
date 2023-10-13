import { Nominal } from 'src/types/Nominal'
import { ProgramClient } from '@peerbit/program'
import { Role } from '@peerbit/document'
import { SyncFilter } from '@peerbit/shared-log'

export type PeerId = Nominal<string, 'PeerId'>
export type Args = { role?: Role; sync?: SyncFilter }

export function getIdFromPeer(peer?: ProgramClient) {
  return peer?.identity.publicKey.hashcode() as PeerId
}
