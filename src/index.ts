export type {
  RegistryIndex,
  ProjectMetadata,
  VersionMetadata,
  RegistryClientConfig,
} from './types.js'

export { configure, getConfig } from './config.js'
export { cacheClear } from './cache.js'
export { RegistryFetchError, RegistryNotFoundError, RegistryConfigurationError } from './errors.js'

import { fetchJson } from './fetch.js'
import type { RegistryIndex, ProjectMetadata, VersionMetadata } from './types.js'

export async function getRegistryIndex(): Promise<RegistryIndex> {
  return fetchJson<RegistryIndex>('index.json')
}

export async function getProjects(): Promise<ProjectMetadata[]> {
  const index = await getRegistryIndex()
  return Promise.all(index.projects.map((name) => getProject(name)))
}

export async function getProject(name: string): Promise<ProjectMetadata> {
  return fetchJson<ProjectMetadata>(`projects/${name}.json`)
}

export async function getVersions(name: string): Promise<VersionMetadata[]> {
  return fetchJson<VersionMetadata[]>(`projects/${name}/versions/index.json`)
}

export async function getVersion(name: string, version: string): Promise<VersionMetadata> {
  return fetchJson<VersionMetadata>(`projects/${name}/versions/${version}.json`)
}
