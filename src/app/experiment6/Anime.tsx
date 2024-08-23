import React, {
  forwardRef,
  ReactNode,
  Ref,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import anime, { AnimeInstance, AnimeParams } from 'animejs'
import rfdc from 'rfdc'

const deepClone = rfdc()

export interface AnimeWrapperParams<T> extends Omit<AnimeParams, 'targets'> {
  readonly targets?: Array<keyof T> | keyof T
}

export interface AnimeControls extends AnimeInstance {
  seekPercent(scrollPercent: number): void
}

interface AnimeProps<T> {
  defaultValues: Readonly<T>
  flightPlan: Readonly<AnimeWrapperParams<T>[]>
  children: (animatedValues: T) => ReactNode
}

const Anime = <T,>(
  { defaultValues, flightPlan, children }: AnimeProps<T>,
  ref: Ref<AnimeInstance>
) => {
  // Deep clone ensures that references to Animejs targets are private and internal.
  const clone = deepClone(defaultValues)
  const animeTargetsRef = useRef<T>(clone)
  const [reactValues, setReactValues] = useState<T>(animeTargetsRef.current)

  const animation = useMemo(() => {
    if (!hasSameKeys(defaultValues, animeTargetsRef.current as object)) {
      // This lets us pass in new default values or a new flight plan, and the animation will rebuild.
      console.log('Animation default values and current requested values are no longer matched.')
      const clone = deepClone(defaultValues)
      animeTargetsRef.current = clone
      setReactValues({ ...animeTargetsRef.current })
    }

    console.log('Flight plan updated. Rebuilding animation.', defaultValues, flightPlan)
    const currentValues = { ...animeTargetsRef.current }
    const animeParams = getAnimeParamsFromAnimeWrapperParams<T>(flightPlan, animeTargetsRef)
    const [firstParams, ...restParams] = animeParams

    const updateHandlerConfig = {
      // Sync React values with Animejs values.
      // This causes React to re-render the children with the new values.
      update: (anim: AnimeInstance) => {
        firstParams?.update?.(anim)
        setReactValues({ ...animeTargetsRef.current })
      },
    }
    // To avoid teleportation as we update flight plans, we need to set the initial values of
    // the targets to be the current values.
    const timeline = anime.timeline({ ...currentValues, ...firstParams, ...updateHandlerConfig })
    restParams.forEach(timeline.add)

    return timeline
  }, [defaultValues, flightPlan])

  // This exposes the animation controls to the parent component.
  useImperativeHandle(
    ref,
    () => ({
      play() {
        animation?.play()
      },
      pause() {
        animation?.pause()
      },
      restart() {
        animation?.restart()
      },
      reverse() {
        animation?.reverse()
      },
      seek(time: number) {
        animation?.seek(time)
      },
      tick(time: number) {
        animation?.tick(time)
      },
      seekPercent(scrollPercent: number) {
        animation?.seek((scrollPercent / 100) * animation?.duration)
      },
      get began() {
        return animation?.began
      },
      get paused() {
        return animation?.paused
      },
      get completed() {
        return animation?.completed
      },
      get finished() {
        return animation?.finished
      },
      get autoplay() {
        return animation?.autoplay
      },
      get currentTime() {
        return animation?.currentTime
      },
      get delay() {
        return animation?.delay
      },
      get direction() {
        return animation?.direction
      },
      get duration() {
        return animation?.duration
      },
      get loop() {
        return animation?.loop
      },
      get timelineOffset() {
        return animation?.timelineOffset
      },
      get progress() {
        return animation?.progress
      },
      get remaining() {
        return animation?.remaining
      },
      get reversed() {
        return animation?.reversed
      },
      get animatables() {
        return animation?.animatables
      },
      get animations() {
        return animation?.animations
      },
    }),
    [animation]
  )

  useEffect(() => {
    return () => {
      // Stop the animation when the component is unmounted.
      animation?.pause()
    }
  }, [animation])

  return <>{children(reactValues)}</>
}

export default forwardRef(Anime) as <T>(
  props: AnimeProps<T> & { ref?: Ref<AnimeInstance> }
) => ReactNode

// Animejs can work with DOM elements directly, and SVG elements,
// but our requirement here is to define animations in React JSX instead.
// Fortunately, Animejs can work with plain JavaScript objects as well.
// This wrapper component internalizes those target objects, and doesn't expose them
// to the consumer.
// To continue supporting multiple targets, we instead expose string references
// to the internal target objects.
// This function converts the string references to the internal target objects.
function getAnimeParamsFromAnimeWrapperParams<T>(
  flightPlan: Readonly<AnimeWrapperParams<T>[]>,
  animeTargetsRef: React.MutableRefObject<T>
): AnimeParams[] {
  return flightPlan.map<AnimeParams>((config) => {
    const { targets, ...rest } = config
    if (typeof targets === 'string') {
      // @ts-ignore Typescript: Type 'keyof T & string' cannot be used to index type 'T'.
      const target = animeTargetsRef.current[targets]
      return { targets: [target], ...rest } as AnimeParams
    } else if (Array.isArray(targets)) {
      // Filter out duplicate elements
      const uniqueTargets = Array.from(new Set(targets))
      const newTargets = uniqueTargets.map((target) => {
        // @ts-ignore Typescript: Type 'keyof T & string' cannot be used to index type 'T'.
        return animeTargetsRef.current[target] as object
      })
      return { targets: newTargets, ...rest } as AnimeParams
    }
    return config as AnimeParams
  })
}

function hasSameKeys(obj1: object, obj2: object): boolean {
  const defaultKeys = Object.keys(obj1)
  const refKeys = Object.keys(obj2)
  return defaultKeys.length === refKeys.length && defaultKeys.every((key) => refKeys.includes(key))
}
