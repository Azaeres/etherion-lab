'use client'
import ControlLayer from '../Experiment2/ControlLayer'
import { PeerbitContext, usePeerbitDatabaseSetup } from './hooks/usePeerbitDatabase'
// import useOPFS_SQLite3_PersistenceLayer from './hooks/useOPFS_SQLite3_PersistenceLayer'
import AreaSwitch from './AreaSwitch'

export default function Experiment3() {
  const peerbit = usePeerbitDatabaseSetup()
  // useOPFS_SQLite3_PersistenceLayer()
  console.log('Experiment3 render  > peerbit:', peerbit)
  console.log(' > peerbit.peers:', peerbit.peers)
  return (
    <>
      <PeerbitContext.Provider value={peerbit}>
        <AreaSwitch />
        <ControlLayer peerId={peerbit.peerId?.hashcode()} />
      </PeerbitContext.Provider>
    </>
  )
}
