import type { RegistryIndex, ProjectMetadata, VersionMetadata } from './types.js'

export function validateRegistryIndex(data: unknown): data is RegistryIndex {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    Array.isArray(d['projects']) &&
    d['projects'].every((p) => typeof p === 'string')
  )
}

export function validateProjectMetadata(data: unknown): data is ProjectMetadata {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d['name'] === 'string' &&
    typeof d['displayName'] === 'string' &&
    typeof d['description'] === 'string' &&
    Array.isArray(d['tags']) &&
    d['tags'].every((t) => typeof t === 'string') &&
    typeof d['repo'] === 'object' && d['repo'] !== null &&
    typeof d['latestVersion'] === 'string' &&
    typeof d['license'] === 'string'
  )
}

export function validateVersionMetadata(data: unknown): data is VersionMetadata {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d['version'] === 'string' &&
    typeof d['date'] === 'string' &&
    Array.isArray(d['changelog']) &&
    d['changelog'].every((c) => typeof c === 'string') &&
    typeof d['assets'] === 'object' && d['assets'] !== null &&
    typeof d['repoLinks'] === 'object' && d['repoLinks'] !== null &&
    typeof d['license'] === 'string'
  )
}
