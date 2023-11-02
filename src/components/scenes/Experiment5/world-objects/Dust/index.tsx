import { Graphics, useTick } from '@pixi/react'
import { useCallback, useMemo } from 'react'
import { Graphics as PixiGraphics } from 'pixi.js'
import { Meters, Vec2Meters, pxFromMeters } from 'src/utils/physics'
import { Vec2 } from 'planck'
import { WorldObjectProps } from '../../database/WorldObject'
// import { Container, Text } from '@pixi/react'
// import { styles } from 'src/utils/pixi-styles'

const CULLING_DISTANCE = 50.0 as Meters

// export interface DustProps {
//   id: string
//   x: Meters
//   y: Meters
//   destroy?: () => void
//   cameraPosition?: Vec2Meters
//   cullingDistance?: Meters
// }

export interface DustData {
  cullingDistance?: Meters
}

export default function Dust(props: WorldObjectProps<DustData>) {
  // console.log('Dust render  :', props)
  const {
    // id,
    pos_x,
    pos_y,
    unmanifest,
    cameraPositionX,
    cameraPositionY,
    cameraVelocityX,
    cameraVelocityY,
  } = props
  const { cullingDistance } = props.data!
  // const [isSafe, setIsSafe] = useState(true)
  // console.log('Dust  > props:', props)
  // const [cameraPosition, setCameraPosition] = useState<Vec2Meters>()
  // useCameraPositionUpdateListener(setCameraPosition)
  const positionVector = useMemo(() => {
    return new Vec2(-pos_x, -pos_y) as Vec2Meters
  }, [pos_x, pos_y])
  const cameraPosition = useMemo(() => {
    if (cameraPositionX === undefined || cameraPositionY === undefined) {
      return
    } else {
      return new Vec2(cameraPositionX, cameraPositionY) as Vec2Meters
    }
  }, [cameraPositionX, cameraPositionY])
  const cameraVelocity = useMemo(() => {
    if (cameraVelocityX === undefined || cameraVelocityY === undefined) {
      return
    } else {
      return new Vec2(cameraVelocityX, cameraVelocityY) as Vec2Meters
    }
  }, [cameraVelocityX, cameraVelocityY])
  const update = useCallback(() => {
    // console.log('check isSafe to unmanifest dust  :')
    if (cameraPosition && positionVector && unmanifest) {
      // console.log('isPositionWithinCameraBounds  > positionVector:', positionVector)
      // console.log(' > cameraPosition:', cameraPosition)
      // console.log(' > cullingDistance:', cullingDistance)
      const isSafe = isPositionWithinCameraBounds(positionVector, cameraPosition, cullingDistance)
      // if (isSafe !== null) {
      //   setIsSafe(isSafe)
      // }
      // console.log(' > isSafe:', isSafe)
      if (!isSafe) {
        // console.log('isPositionWithinCameraBounds  > positionVector:', positionVector)
        // console.log(' > cameraPosition:', cameraPosition)
        // console.log(' > cullingDistance:', cullingDistance)
        // console.log(' > isSafe:', isSafe)
        // console.log('Unmanifesting dust  :', id)
        unmanifest()
      }
    }
  }, [
    cameraPosition?.x,
    cameraPosition?.y,
    cullingDistance,
    positionVector?.x,
    positionVector?.y,
    unmanifest,
  ])

  useTick(update)
  return <DustGraphic x={pos_x} y={pos_y} cameraVelocity={cameraVelocity} />

  // return (
  //   <Container x={pxFromMeters(pos_x)} y={pxFromMeters(pos_y)}>
  //     <Text text={id} style={styles.smallBody} x={10} y={0} />
  //     <Text text={`[${pos_x}, ${pos_y}]`} style={styles.smallBody} x={10} y={40} />
  //     <Text text={`Is safe: ${isSafe.toString()}`} style={styles.smallBody} x={10} y={80} />
  //     <DustGraphic x={0 as Meters} y={0 as Meters} cameraVelocity={cameraVelocity} />
  //   </Container>
  // )
}

interface DustGraphicProps {
  x: Meters
  y: Meters
  cameraVelocity?: Vec2Meters
}

const SCALAR = 0.03

function DustGraphic(props: DustGraphicProps) {
  const { x, y, cameraVelocity } = props
  // We simulate a motion blur effect by factoring in the camera's velocity.

  // TODO: Now that we've optimized the camera velocity events, we won't
  // get an event at first. So we'll need to come up with a way for components
  // to poll for the camera velocity, then we can set the local component state
  // default to it.
  // const [cameraVelocity, setCameraVelocity] = useState<Vec2Meters>()
  // useCameraVelocityUpdateListener(setCameraVelocity)
  // console.log('DustGraphic render  > cameraVelocity:', cameraVelocity)
  const drawDust = useCallback(
    (g: PixiGraphics) => {
      g.clear()
      // console.log('drawDust  > cameraVelocity:', cameraVelocity)
      if (cameraVelocity) {
        const posX = pxFromMeters(x)
        const posY = pxFromMeters(y)

        // Draw an oversized dust graphic for debug purposes.
        // const bulletSize = 12
        // g.beginFill('#0f0', 3)
        // g.drawRoundedRect(posX, posY, bulletSize, bulletSize, bulletSize)
        // g.endFill()

        g.beginFill('#fff', 1.0)
        g.lineStyle(12, '#777', 0.55)
        g.moveTo(posX, posY)
        g.lineTo(
          pxFromMeters((x - cameraVelocity.x * SCALAR) as Meters),
          pxFromMeters((y + cameraVelocity.y * SCALAR) as Meters)
        )
        g.endFill()
      }
      // else {
      //   console.warn('drawDust  > cameraVelocity:', cameraVelocity)
      // }
    },
    [cameraVelocity?.x, cameraVelocity?.y, x, y]
  )
  return <Graphics draw={drawDust} anchor={0.5} />
}

function isPositionWithinCameraBounds(
  position?: Vec2Meters,
  cameraPosition?: Vec2Meters,
  cullingDistance: Meters = CULLING_DISTANCE
) {
  // console.log(
  //   'isPositionWithinCameraBounds  > position, cameraPosition, cullingDistance:',
  //   position,
  //   cameraPosition,
  //   cullingDistance
  // )
  if (cameraPosition && position) {
    const horizDistance = Math.abs(position.x - cameraPosition.x)
    const vertDistance = Math.abs(position.y + cameraPosition.y)
    // console.log(' > horizDistance, vertDistance:', horizDistance, vertDistance)
    const horizSafe = horizDistance <= cullingDistance
    const vertSafe = vertDistance <= cullingDistance
    // console.log(' > horizSafe, vertSafe:', horizSafe, vertSafe)
    return horizSafe && vertSafe
  } else {
    return null
  }
}
