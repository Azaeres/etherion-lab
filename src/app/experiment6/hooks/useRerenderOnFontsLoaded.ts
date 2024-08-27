import useFontFaceObserver from 'use-font-face-observer'

export default function useRerenderOnFontsLoaded() {
  const isFontListLoaded = useFontFaceObserver([
    { family: 'Roboto Condensed' },
    { family: 'Oswald' },
  ])
  return isFontListLoaded
}
