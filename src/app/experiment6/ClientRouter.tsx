'use client'
import { createBrowserRouter, Navigate, RouterProvider, useParams } from 'react-router-dom'
import { VerseId } from './list'
import VerseSwitch from './VerseSwitch'

const router =
  typeof document === 'undefined'
    ? null
    : createBrowserRouter([
        {
          path: '/',
          element: <Navigate to="/experiment6" replace />,
        },
        {
          path: '/experiment6',
          element: <Navigate to="/experiment6/zhariel/1/1" replace />,
        },
        {
          path: '/experiment6/:book/:chapter/:verse',
          element: <RouteHandler />,
        },
      ])

export default function Router() {
  if (router) {
    return <RouterProvider router={router} />
  } else {
    return null
  }
}

function RouteHandler() {
  const { book, chapter, verse } = useParams()
  const verseId = `${book}/${chapter}/${verse}` as VerseId

  return <VerseSwitch currentVerse={verseId} />
}

// function isValidVerseId(verseId: VerseId): boolean {
//   return !!verseMap[verseId]
// }
