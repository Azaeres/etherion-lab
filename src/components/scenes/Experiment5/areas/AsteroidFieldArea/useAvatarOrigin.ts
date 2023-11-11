import { radiansFromDegrees } from 'src/components/scenes/Experiment2/Button'
import {
  DepthStructuredManifests,
  WorldObjectId,
  WorldObjectManifest,
  WorldObjectModel,
} from '../../database/WorldObject'
import { Meters } from 'src/utils/physics'
import { AreaId } from '../../AreaSwitch/list'
import { PeerId } from '../../database'
import { v4 as uuid } from 'uuid'
import { useMemo } from 'react'
import { AvatarData } from '../../world-objects/PrototypeShip'

const AVATAR_ZINDEX = -500
const NO_OP = () => {}

export function useAvatarOrigin(area: AreaId, peerId: PeerId): DepthStructuredManifests {
  const avatarManifest = useMemo(() => {
    const avatar: WorldObjectModel<AvatarData> = getPrototypeShipModel(
      0.0 as Meters,
      0.0 as Meters,
      area,
      peerId
    )
    const avatarManifest: WorldObjectManifest = {
      worldObjectModel: avatar,
      unmanifest: NO_OP,
      transferOccupancyToWorldObject: NO_OP,
    }
    return avatarManifest
  }, [area, peerId])
  return {
    [AVATAR_ZINDEX]: [avatarManifest],
  }
}

function getPrototypeShipModel(
  x: Meters,
  y: Meters,
  area: AreaId,
  upstreamPeer: PeerId
): WorldObjectModel<AvatarData> {
  return {
    id: uuid() as WorldObjectId,
    component: 'PrototypeShip',
    area,
    upstream_peer: upstreamPeer,
    orphan: false,
    pos_x: x,
    pos_y: y,
    pos_z: AVATAR_ZINDEX,
    rotation: radiansFromDegrees(-90),
    scale: 6,
    data: {
      owner: upstreamPeer,
    },
  }
}

// import { Meters } from 'src/utils/physics'
// import { radiansFromDegrees } from '../../../Experiment2/Button'
// import PrototypeShip from '../PrototypeShip'
// import { AreaId } from '../../AreaSwitch/list'
// import { usePeer } from '@peerbit/react'
// import { getIdFromPeer } from '../../database'

// export interface AvatarOriginProps {
//   area: AreaId
// }

// export default function AvatarOrigin(props: AvatarOriginProps) {
//   const { area } = props
//   const { peer } = usePeer()
//   const peerId = getIdFromPeer(peer)
//   // console.log('AvatarOrigin > peerId:', peerId)
//   if (peerId === undefined) {
//     return null
//   }
//   const defaultConfig = {
// id: '1',
// area,
// upstream_peer: peerId,
// pos_x: 0.0 as Meters,
// pos_y: 0.0 as Meters,
// pos_z: -500,
// rotation: radiansFromDegrees(-90),
// scale: 6,
// orphan: false,
//   } as const
//   return <PrototypeShip {...defaultConfig} />
// }
