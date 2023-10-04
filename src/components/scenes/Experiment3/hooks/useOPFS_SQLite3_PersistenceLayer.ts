import { useCallback, useEffect, useMemo } from 'react'

export default function useOPFS_SQLite3_PersistenceLayer() {
  const onWorkerMessage = useCallback((event: MessageEvent<unknown>) => {
    console.log('Host received:', event.data)
  }, [])
  const worker = useMemo(() => {
    console.log('Creating new worker...  :')
    // https://webpack.js.org/guides/web-workers/
    return new Worker(new URL('src/example.worker.js', import.meta.url))
  }, [])
  useEffect(() => {
    console.log('Adding event listener...  :')
    worker.onmessage = onWorkerMessage
    // worker.addEventListener('message', onWorkerMessage)
    setTimeout(() => {
      console.log('Posting message to web worker...  :', worker)
      worker.postMessage('from Host')
    }, 2000)
    return () => {
      worker.terminate()
    }
  }, [onWorkerMessage, worker])
  return worker
}
