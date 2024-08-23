import type { Metadata, Viewport } from 'next'
import { type ReactNode } from 'react'
import Client from 'src/components/Client'
import Providers from './Providers'

const APP_NAME = 'Etherion Lab'
const APP_DESCRIPTION = 'Experiment playground'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: '%s - PWA App',
  },
  description: APP_DESCRIPTION,
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME,
    startupImage: '/apple-touch-icon.png',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { type: 'image/png', sizes: '32x32', url: '/favicon-32x32.png' },
      { type: 'image/png', sizes: '16x16', url: '/favicon-16x16.png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: css }}></style>
      </head>
      <body>
        <div id="root">
          <Providers>{children}</Providers>
        </div>
      </body>
      <Client />
    </html>
  )
}

const css = `
/* Centering */

html,
body,
#root {
  height: 100%;
  color: white;
}

#root {
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  max-width: 100vw;
  max-height: 100vh;
}

/* End centering */

body {
  background: #0b0e14;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

#root > canvas[style] {
  width: auto !important;
  height: auto !important;

  /* Disable text selection */
  user-select: none; /* Standard property */
  -webkit-user-select: none; /* Safari and Chrome */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */

  /* Disable touch callout */
  -webkit-touch-callout: none; /* Safari */
}
`
