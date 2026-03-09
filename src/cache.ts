interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.value
}

export function cacheSet<T>(key: string, value: T, ttl: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttl })
}

export function cacheClear(): void {
  store.clear()
}
