import {
  validateRegistryIndex,
  validateProjectMetadata,
  validateVersionMetadata,
} from '../src/validators.js'

describe('validators', () => {
  describe('validateRegistryIndex', () => {
    it('returns true for a valid index', () => {
      const data = { projects: ['project-a', 'project-b'] }
      expect(validateRegistryIndex(data)).toBe(true)
    })

    it('returns false for invalid data', () => {
      expect(validateRegistryIndex(null)).toBe(false)
      expect(validateRegistryIndex({})).toBe(false)
      expect(validateRegistryIndex({ projects: 'not-an-array' })).toBe(false)
      expect(validateRegistryIndex({ projects: [123] })).toBe(false)
    })
  })

  describe('validateProjectMetadata', () => {
    const validProject = {
      name: 'my-project',
      displayName: 'My Project',
      description: 'A test project.',
      tags: ['code'],
      repo: { github: '...' },
      latestVersion: 'v1.0.0',
      license: 'MIT',
    }

    it('returns true for a valid project', () => {
      expect(validateProjectMetadata(validProject)).toBe(true)
    })

    it('returns false for invalid data', () => {
      expect(validateProjectMetadata(null)).toBe(false)
      expect(validateProjectMetadata({ ...validProject, name: 123 })).toBe(false)
      expect(validateProjectMetadata({ ...validProject, repo: null })).toBe(false)
      expect(validateProjectMetadata({ ...validProject, tags: 'not-an-array' })).toBe(false)
      const { description, ...incomplete } = validProject
      expect(validateProjectMetadata(incomplete)).toBe(false)
    })
  })

  describe('validateVersionMetadata', () => {
    const validVersion = {
      version: 'v1.0.0',
      date: '2023-01-01',
      changelog: ['Fixed bugs'],
      assets: { source: ['...'] },
      repoLinks: { githubTag: '...' },
      license: 'MIT',
    }

    it('returns true for a valid version', () => {
      expect(validateVersionMetadata(validVersion)).toBe(true)
    })

    it('returns false for invalid data', () => {
      expect(validateVersionMetadata(null)).toBe(false)
      expect(validateVersionMetadata({ ...validVersion, version: 123 })).toBe(false)
      expect(validateVersionMetadata({ ...validVersion, assets: null })).toBe(false)
      expect(validateVersionMetadata({ ...validVersion, changelog: 'not-an-array' })).toBe(false)
      const { license, ...incomplete } = validVersion
      expect(validateVersionMetadata(incomplete)).toBe(false)
    })
  })
})
