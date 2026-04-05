import { configure, getRegistryIndex, getProjects, getProject, getVersions, getVersion, RegistryConfigurationError } from '../src/index.js'
import { cacheClear } from '../src/cache.js'

const mockIndex = { projects: ['my-project', 'another-project'] }

const mockProject = {
  name: 'my-project',
  displayName: 'My Project',
  description: 'A test project.',
  tags: ['code', 'tool'],
  repo: { github: 'https://github.com/example/my-project' },
  latestVersion: 'v0.1.0',
  license: 'MIT',
}

const mockVersionsIndex = [
  {
    version: 'v0.1.0',
    date: '2026-03-01',
    changelog: ['Initial release'],
    assets: { source: ['https://example.com/v0.1.0.tar.gz'] },
    repoLinks: { githubTag: 'https://github.com/example/my-project/tree/v0.1.0' },
    license: 'MIT',
  },
]

const mockVersion = mockVersionsIndex[0];

function mockFetch(responses: Record<string, unknown>) {
  global.fetch = async (input: RequestInfo | URL) => {
    const url = input.toString()
    for (const [pattern, body] of Object.entries(responses)) {
      if (url.endsWith(pattern)) {
        return new Response(JSON.stringify(body), { status: 200 })
      }
    }
    return new Response('Not Found', { status: 404 })
  }
}

beforeEach(() => {
  cacheClear()
  configure({ baseUrl: 'https://test.example.com/', cache: false })
})

describe('getRegistryIndex', () => {
  it('fetches index.json and returns the index', async () => {
    mockFetch({ 'index.json': mockIndex })
    const index = await getRegistryIndex()
    expect(index.projects).toEqual(['my-project', 'another-project'])
  })
})

describe('getProject', () => {
  it('fetches a project by name', async () => {
    mockFetch({ 'projects/my-project.json': mockProject })
    const project = await getProject('my-project')
    expect(project.name).toBe('my-project')
    expect(project.license).toBe('MIT')
  })

  it('throws RegistryNotFoundError for unknown projects', async () => {
    mockFetch({})
    await expect(getProject('ghost')).rejects.toMatchObject({ name: 'RegistryNotFoundError' })
  })
})

describe('getProjects', () => {
  it('fetches all projects from the index', async () => {
    mockFetch({
      'index.json': mockIndex,
      'projects/my-project.json': mockProject,
      'projects/another-project.json': { ...mockProject, name: 'another-project', displayName: 'Another Project' },
    })
    const projects = await getProjects()
    expect(projects).toHaveLength(2)
    expect(projects[0]?.name).toBe('my-project')
  })
})

describe('getVersions', () => {
  it('fetches the version index for a project', async () => {
    mockFetch({ 'projects/my-project/versions/index.json': mockVersionsIndex })
    const versions = await getVersions('my-project')
    expect(versions).toHaveLength(1)
    expect(versions[0]?.version).toBe('v0.1.0')
  })
})

describe('getVersion', () => {
  it('fetches a specific version', async () => {
    mockFetch({ 'projects/my-project/versions/v0.1.0.json': mockVersion })
    const version = await getVersion('my-project', 'v0.1.0')
    expect(version.version).toBe('v0.1.0')
    expect(version.changelog).toContain('Initial release')
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
