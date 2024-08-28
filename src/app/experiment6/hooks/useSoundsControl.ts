import { useMemo } from 'react'
import { SoundsControl } from '../SoundsControl'

const soundsControl = new SoundsControl()

export default function useSoundsControl() {
  return useMemo(() => {
    return soundsControl
  }, [])
}
