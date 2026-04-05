import type { RegistryClientConfig } from './types.js'

let _config: Required<RegistryClientConfig> = {
  baseUrl: '',
  cache: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
}

export function configure(config: RegistryClientConfig): void {
  _config = { ..._config, ...config }
}

export function getConfig(): Required<RegistryClientConfig> {
  return _config
}
