export type Inspect<T> = {
  [K in keyof T]: T[K]
} & unknown
