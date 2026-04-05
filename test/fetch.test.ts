import { configure, getRegistryIndex, getProjects, getProject, getVersions, getVersion, RegistryConfigurationError } from '../src/index.js'
import { cacheClear } from '../src/cache.js'
import * as fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REGISTRY_PATH = path.join(__dirname, 'example-registry')

const mockProject = {
  name: 'my-project',
  displayName: 'My Project',
  description: 'A test project.',
  tags: ['code', 'tool'],
  repo: { github: 'https://github.com/example/my-project' },
  latestVersion: 'v0.1.0',
  license: 'MIT',
}

const mockIndex = { projects: ['my-project'] }

async function mockFetchFromFile() {
  global.fetch = (async (input: RequestInfo | URL) => {
    const url = input.toString()
    const relativePath = url.replace('https://test.example.com/', '')
    const filePath = path.join(REGISTRY_PATH, relativePath)

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return new Response(content, { status: 200 })
    } catch (error) {
      return new Response('Not Found', { status: 404 })
    }
  }) as typeof fetch
}

beforeEach(async () => {
  cacheClear()
  configure({ baseUrl: 'https://test.example.com/', cache: false })
  await mockFetchFromFile()
})

describe('getRegistryIndex', () => {
  it('fetches index.json and returns the index', async () => {
    const index = await getRegistryIndex()
    expect(index.projects).toEqual(['my-project'])
  })

  it('throws error if index is invalid', async () => {
    global.fetch = async () => new Response(JSON.stringify({ projects: [123] }), { status: 200 })
    await expect(getRegistryIndex()).rejects.toThrow('Invalid RegistryIndex received from registry.')
  })
})

describe('getProject', () => {
  it('fetches a project by name', async () => {
    const project = await getProject('my-project')
    expect(project.name).toBe('my-project')
    expect(project.license).toBe('MIT')
  })

  it('throws RegistryNotFoundError for unknown projects', async () => {
    await expect(getProject('ghost')).rejects.toMatchObject({ name: 'RegistryNotFoundError' })
  })

  it('throws error if project metadata is invalid', async () => {
    global.fetch = async () => new Response(JSON.stringify({ name: 123 }), { status: 200 })
    await expect(getProject('my-project')).rejects.toThrow('Invalid ProjectMetadata received for project "my-project".')
  })
})

describe('getProjects', () => {
  it('fetches all projects from the index', async () => {
    const projects = await getProjects()
    expect(projects).toHaveLength(1)
    expect(projects[0]?.name).toBe('my-project')
  })
})

describe('getVersions', () => {
  it('fetches the version index for a project', async () => {
    const versions = await getVersions('my-project')
    expect(versions).toHaveLength(1)
    expect(versions[0]?.version).toBe('v0.1.0')
  })

  it('throws error if version index is invalid', async () => {
    global.fetch = async () => new Response(JSON.stringify({ not: 'an-array' }), { status: 200 })
    await expect(getVersions('my-project')).rejects.toThrow('Invalid version index received for project "my-project".')
  })
})

describe('getVersion', () => {
  it('fetches a specific version', async () => {
    const version = await getVersion('my-project', 'v0.1.0')
    expect(version.version).toBe('v0.1.0')
    expect(version.changelog).toContain('Initial release')
  })

  it('throws error if version metadata is invalid', async () => {
    global.fetch = async () => new Response(JSON.stringify({ version: 123 }), { status: 200 })
    await expect(getVersion('my-project', 'v0.1.0')).rejects.toThrow('Invalid VersionMetadata received for project "my-project" version "v0.1.0".')
  })
})

describe('caching', () => {
  it('returns cached value on second call', async () => {
    let callCount = 0
    global.fetch = async () => {
      callCount++
      return new Response(JSON.stringify(mockProject), { status: 200 })
    }
    configure({ cache: true, cacheTTL: 60_000 })
    await getProject('my-project')
    await getProject('my-project')
    expect(callCount).toBe(1)
  })

  it('returns undefined and fetches again if cache is expired', async () => {
    let callCount = 0
    global.fetch = async () => {
      callCount++
      return new Response(JSON.stringify(mockProject), { status: 200 })
    }
    configure({ cache: true, cacheTTL: -1 }) // Expired immediately
    await getProject('my-project')
    await getProject('my-project')
    expect(callCount).toBe(2)
  })
})

describe('configure', () => {
  it('uses a custom baseUrl', async () => {
    let capturedUrl = ''
    global.fetch = async (input: RequestInfo | URL) => {
      capturedUrl = input.toString()
      return new Response(JSON.stringify(mockIndex), { status: 200 })
    }
    configure({ baseUrl: 'https://custom.example.com/registry/' })
    await getRegistryIndex()
    expect(capturedUrl).toBe('https://custom.example.com/registry/index.json')
  })

  it('throws RegistryConfigurationError if baseUrl is empty', async () => {
    configure({ baseUrl: '' })
    await expect(getRegistryIndex()).rejects.toMatchObject({ name: 'RegistryConfigurationError' })
  })
})
