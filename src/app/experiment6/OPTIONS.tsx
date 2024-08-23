export const OPTIONS = {
  width: 2592,
  height: 1080,
  // antialias: true, // Causing frequent webkit crashes on iOS.
  hello: true,
  // Using the default resolution caused inconsistent canvas
  // sizes between Apple and non-Apple devices.
  resolution: 1,
  // backgroundColor: 0x000000,
  // roundPixels: true,
} as const
