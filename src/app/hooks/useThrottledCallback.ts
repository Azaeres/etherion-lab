import { useMemo, useEffect } from 'react'
import { throttle } from 'throttle-debounce'

export default function useThrottledCallback(delay: number, callback: () => void) {
  const throttled = useMemo(() => {
    return throttle(delay, callback, { noTrailing: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay])
  useEffect(() => {
    return () => {
      throttled.cancel()
    }
  }, [throttled])
  return throttled
}
