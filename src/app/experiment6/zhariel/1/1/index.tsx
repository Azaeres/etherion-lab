'use client'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { OPTIONS } from '../../../OPTIONS'
import NarrationTextBox, { Controls } from '../../../components/NarrationTextBox'
import Overlay from '../../../Overlay'
import useReactRouterNavigate from '../../../hooks/useReactRouterNavigate'
import useSoundsControl from '../../../hooks/useSoundsControl'
// import { SoundsControl } from 'sounds-control'
// import Battery from './Battery'
// import useNextjsNavigate from '../../hooks/useNextjsNavigate'

// type TransitionState = 'running' | 'idle'

// const boyTexture = Texture.from(boy.src)

export default function BookOfZhariel() {
  const soundsControl = useSoundsControl()
  const navigate = useReactRouterNavigate()
  // const nextNavigate = useNextjsNavigate()

  // const animationControls = useRef<AnimeControls>(null)
  // const [transition, setTransition] = useState<TransitionState>('running')
  const controls = useRef<Controls>(null)
  const click = useCallback(() => {
    if (controls.current?.isPlaying) {
      controls.current?.interrupt()
    } else {
      navigate('/experiment6/zhariel/1/2')()
    }
  }, [navigate])

  const windSoundPromise = useMemo(() => {
    if (soundsControl.isSoundLoaded('wind')) {
      return Promise.resolve()
    } else {
      return soundsControl.loadSound(
        '/audio/zapsplat_nature_wind_constant_strong_howling_dark_storm_003_70457.mp3',
        'wind'
      )
    }
  }, [])

  useEffect(() => {
    windSoundPromise.then(() => {
      soundsControl.loop('wind')
    })
    // if (!soundsControl.isSoundPlaying('wind')) {
    // }
  }, [])

  // const [displayText, setDisplayText] = useState(`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`)
  // useEffect(() => {
  //   setTimeout(() => {
  //     setDisplayText('apoijsd fpoiasj dfpoijas pdofij aspodifj paosid jf')
  //   }, 2000)
  //   // console.log(' > useEffect displayText:', displayText)
  // }, [displayText])
  return (
    <>
      {/* <Sprite
        texture={boyTexture}
        x={OPTIONS.width / 2}
        y={OPTIONS.height / 2}
        anchor={0.5}
        scale={2.6}
      /> */}
      <NarrationTextBox
        // text={displayText}
        // text="Lorem."
        // text="Lorem ipsum dolor sit amet."
        // text={`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`}
        text={`I found you...`}
        // text={`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`}
        wordWrapWidth={OPTIONS.width / 2 + 600}
        ref={controls}
        // onComplete={onComplete}
        // animationControls={animationControls}
      />
      <Overlay onPointerUp={click} />
      {/* <Battery /> */}
      {/* <Text
        text="Zhariel 1:1"
        x={400}
        y={300}
        anchor={0.5}
        eventMode="static"
        cursor="pointer" // Set cursor to pointer
        onpointerup={gotoPage('/experiment6/zhariel/1/2')}
        style={style}
      /> */}
      {/* <Button
        text="&equiv; Menu"
        x={100}
        y={50}
        width={300}
        height={100}
        onPress={nextNavigate('/')}
      /> */}
      {/* <Curtain /> */}
    </>
  )
}
