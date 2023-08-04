'use client'
import { useEffect } from 'react'

export default function PWA() {
  useEffect(() => {
    console.info(`Etherion Lab v${process.env.NEXT_PUBLIC_APP_VERSION}`)
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      console.log('Home useEffect  :')
      const wb = window.workbox
      let reloading = false

      // add event listeners to handle PWA lifecycle events
      wb.addEventListener('installed', (event) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      // Add an event listener to detect when the registered
      // service worker has installed but is waiting to activate.
      wb.addEventListener('waiting', () => {
        console.log('waiting event triggered  :')
        // When `event.wasWaitingBeforeRegister` is true, a previously
        // updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.

        // This code assumes your app has a promptForUpdate() method,
        // which returns true if the user wants to update.
        // Implementing this is app-specific; some examples are:
        // https://open-ui.org/components/alert.research or
        // https://open-ui.org/components/toast.research
        if (confirm('A newer version of this web app is available, reload to update?')) {
          console.log('user confirmed reload')
          // Send a message to the waiting service worker, instructing it to activate.
          // Assuming the user accepted the update, set up a listener
          // that will reload the page as soon as the previously waiting
          // service worker has taken control.
          wb.addEventListener('controlling', () => {
            console.log('user confirmed reload - controlling event triggered  :')
            // At this point, reloading will ensure that the current
            // tab is loaded under the control of the new service worker.
            // Depending on your web app, you may want to auto-save or
            // persist transient state before triggering the reload.
            if (!reloading) {
              console.log('reloading...  :')
              reloading = true
              window.location.reload()
            }
          })

          console.log('triggering SKIP_WAITING  :')
          wb.messageSkipWaiting()
        } else {
          console.log(
            'User rejected to update SW, keeping the old version. New version will be automatically loaded when the app is opened next time.'
          )
        }
      })

      wb.addEventListener('controlling', (event) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      wb.addEventListener('activated', (event) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      console.log('wb.register()  :')
      // never forget to call register as automatic registration is turned off in next.config.js
      wb.register()
    }
  }, [])
  return null
}
