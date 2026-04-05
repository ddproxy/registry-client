import { getConfig } from './config.js'
import { cacheGet, cacheSet } from './cache.js'
import { RegistryFetchError, RegistryNotFoundError, RegistryConfigurationError } from './errors.js'

export async function fetchJson<T>(path: string): Promise<T> {
  const config = getConfig()

  if (!config.baseUrl) {
    throw new RegistryConfigurationError()
  }

  const url = config.baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '')

  if (config.cache) {
    const cached = cacheGet<T>(url)
    if (cached !== undefined) return cached
  }

  const res = await fetch(url)

  if (res.status === 404) throw new RegistryNotFoundError(url)
  if (!res.ok) throw new RegistryFetchError(url, res.status)

  const data = (await res.json()) as T

  if (config.cache) {
    cacheSet(url, data, config.cacheTTL)
  }

  return data
}
