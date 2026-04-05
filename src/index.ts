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
import {
  validateRegistryIndex,
  validateProjectMetadata,
  validateVersionMetadata,
} from './validators.js'

export async function getRegistryIndex(): Promise<RegistryIndex> {
  const data = await fetchJson<RegistryIndex>('index.json')
  if (!validateRegistryIndex(data)) {
    throw new Error('Invalid RegistryIndex received from registry.')
  }
  return data
}

export async function getProjects(): Promise<ProjectMetadata[]> {
  const index = await getRegistryIndex()
  return Promise.all(index.projects.map((name) => getProject(name)))
}

export async function getProject(name: string): Promise<ProjectMetadata> {
  const data = await fetchJson<ProjectMetadata>(`projects/${name}.json`)
  if (!validateProjectMetadata(data)) {
    throw new Error(`Invalid ProjectMetadata received for project "${name}".`)
  }
  return data
}

export async function getVersions(name: string): Promise<VersionMetadata[]> {
  const data = await fetchJson<VersionMetadata[]>(`projects/${name}/versions/index.json`)
  if (!Array.isArray(data) || !data.every(validateVersionMetadata)) {
    throw new Error(`Invalid version index received for project "${name}".`)
  }
  return data
}

export async function getVersion(name: string, version: string): Promise<VersionMetadata> {
  const data = await fetchJson<VersionMetadata>(`projects/${name}/versions/${version}.json`)
  if (!validateVersionMetadata(data)) {
    throw new Error(`Invalid VersionMetadata received for project "${name}" version "${version}".`)
  }
  return data
}
