import { Meters } from 'src/utils/physics'
import { radiansFromDegrees } from '../../../Experiment2/Button'
import PrototypeShip from '../PrototypeShip'
import { AreaId } from '../../AreaSwitch/list'
import { usePeer } from '@peerbit/react'
import { getIdFromPeer } from '../../database'

export interface AvatarOriginProps {
  area: AreaId
}

export default function AvatarOrigin(props: AvatarOriginProps) {
  const { area } = props
  const { peer } = usePeer()
  const peerId = getIdFromPeer(peer)
  // console.log('AvatarOrigin > peerId:', peerId)
  if (peerId === undefined) {
    return null
  }
  const defaultConfig = {
    id: '1',
    area,
    owner: peerId,
    pos_x: 0.0 as Meters,
    pos_y: 0.0 as Meters,
    pos_z: -500,
    rotation: radiansFromDegrees(-90),
    scale: 6,
    orphan: false,
  } as const
  return <PrototypeShip {...defaultConfig} />
}
