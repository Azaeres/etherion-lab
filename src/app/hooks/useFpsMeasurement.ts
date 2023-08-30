import { Ticker } from 'pixi.js'
import { useCallback, useEffect, useRef, useState } from 'react'

const SAMPLE_COUNT = 30

export default function useFpsMeasurement() {
  // const [lastTime, setLastTime] = useState(new Date().getTime())
  const [currentFps, setCurrentFps] = useState<number | null>(null)
  const timeSamples = useRef<number[]>([])
  const lastTime = useRef<number>(new Date().getTime())
  // const [timeValues, setTimeValues] = useState<number[]>([])
  const measureFps = useCallback(() => {
    const currentTime = new Date().getTime()
    timeSamples.current = [...timeSamples.current, 1000 / (currentTime - lastTime.current)]
    if (timeSamples.current.length === SAMPLE_COUNT) {
      const total = timeSamples.current.reduce((acc, timeValue) => {
        return acc + timeValue
      }, 0)
      setCurrentFps(total / 30)
      timeSamples.current = []
    }
    lastTime.current = currentTime
  }, [])
  useEffect(() => {
    // console.log('creating new ticker  :')
    const fpsTicker = new Ticker()
    fpsTicker.add(measureFps)
    fpsTicker.start()
    return () => {
      // console.log('STOPPING FPS TICKER  :')
      fpsTicker.stop()
    }
  }, [measureFps])
  return currentFps
}
