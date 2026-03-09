export class RegistryFetchError extends Error {
  readonly status: number
  readonly url: string

  constructor(url: string, status: number, message?: string) {
    super(message ?? `Registry fetch failed: ${status} ${url}`)
    this.name = 'RegistryFetchError'
    this.status = status
    this.url = url
  }
}

export class RegistryNotFoundError extends RegistryFetchError {
  constructor(url: string) {
    super(url, 404, `Registry resource not found: ${url}`)
    this.name = 'RegistryNotFoundError'
  }
}
