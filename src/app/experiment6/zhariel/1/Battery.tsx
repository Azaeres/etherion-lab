import { TextStyle } from 'pixi.js'
import { Text } from '@pixi/react'
import Anime, { AnimeWrapperParams } from '../../Anime'
import { OPTIONS } from '../../OPTIONS'

type Battery = {
  charged: string
  cycles: number
}
type AnimationValues = {
  battery: Battery
}

const style = new TextStyle({
  fontFamily: `Oswald, sans-serif`,
  // fontStyle: inter.style.fontStyle as TextStyleFontStyle,
  fontSize: 48,
  fill: 0xffffff,
  dropShadow: true,
  dropShadowAlpha: 0.8,
  dropShadowDistance: 4,
  dropShadowBlur: 4,
  dropShadowColor: 0x000000,
  wordWrap: true,
  wordWrapWidth: OPTIONS.width / 2 - 400,
})

const defaultBattery: Battery = {
  charged: '0%',
  cycles: 120,
} as const
const defaultKeyedValues: AnimationValues = {
  battery: {
    ...defaultBattery,
  },
} as const

const flightPlan: AnimeWrapperParams<AnimationValues>[] = [
  {
    direction: 'alternate',
    loop: true,
    autoplay: true,
    easing: 'easeInOutQuad',
    duration: 6000,
  },
  {
    targets: ['battery'],
    charged: '100%',
    cycles: 130,
    round: 1,
  },
] as const

export default function Battery() {
  return (
    <Anime<AnimationValues> defaultValues={defaultKeyedValues} flightPlan={flightPlan}>
      {(animatedValues) => {
        return (
          <>
            <Text
              text={`Battery: ${animatedValues.battery.charged} (${animatedValues.battery.cycles} cycles)`}
              x={600}
              y={500}
              anchor={0.5}
              eventMode="static"
              cursor="pointer" // Set cursor to pointer
              style={style}
            />
          </>
        )
      }}
    </Anime>
  )
}
