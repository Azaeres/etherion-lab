/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react'

console.log('wdyr.ts loaded!  :')

if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render')
    console.log(' > whyDidYouRender:', whyDidYouRender)
    whyDidYouRender(React, {
      trackAllPureComponents: true,
      trackHooks: true,
      logOnDifferentValues: true,
      // https://github.com/welldone-software/why-did-you-render/issues/272#issuecomment-1645114930
      include: [/./],
    })
  }
}

const test = 'TEST'
export default test
