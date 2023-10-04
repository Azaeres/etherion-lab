import { Meters } from 'src/utils/physics'
import { radiansFromDegrees } from '../../Experiment2/Button'
import PrototypeShip from '../PrototypeShip'
import usePeerbitDatabase from '../hooks/usePeerbitDatabase'
import { AreaId } from '../AreaSwitch/areas'

export interface AvatarOriginProps {
  area: AreaId
}

// TODO: Move radiansFromDegrees, etc., out of the Button component and into utils.
export default function AvatarOrigin(props: AvatarOriginProps) {
  const { area } = props
  const { peerId } = usePeerbitDatabase()
  console.log('AvatarOrigin > peerId:', peerId)
  if (peerId === undefined) {
    return null
  }
  const defaultConfig = {
    area,
    owner: peerId,
    pos_x: 0.0 as Meters,
    pos_y: 0.0 as Meters,
    rotation: radiansFromDegrees(-90),
    scale: 6,
    orphan: false,
  } as const
  return <PrototypeShip {...defaultConfig} />
}
