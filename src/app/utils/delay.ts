// // Usage example:
// return delay(2000).then(() => {
//   return import('./zhariel/2')
// })

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
