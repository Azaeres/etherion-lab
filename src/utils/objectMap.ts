export default function objectMap<T, U>(
  obj: { [s: string]: U },
  func: (key: string, value: U) => T
) {
  return Object.fromEntries<T>(Object.entries<U>(obj).map(([k, v]) => [k, func(k, v)]))
}
