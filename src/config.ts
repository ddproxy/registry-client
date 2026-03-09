import type { RegistryClientConfig } from './types.js'

const DEFAULT_BASE_URL = 'https://raw.githubusercontent.com/ddproxy/registry/main/'

let _config: Required<RegistryClientConfig> = {
  baseUrl: DEFAULT_BASE_URL,
  cache: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
}

export function configure(config: RegistryClientConfig): void {
  _config = { ..._config, ...config }
}

export function getConfig(): Required<RegistryClientConfig> {
  return _config
}
