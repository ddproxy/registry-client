# @ddproxy/registry-client

TypeScript client for fetching data from a [project registry](https://github.com/ddproxy/project-registry). Handles configuration, HTTP fetching, validation, and in-memory caching.

## Installation

```bash
npm install @ddproxy/registry-client
```

Published to the GitHub Package Registry. Ensure your `.npmrc` points to the right registry:

```
@ddproxy:registry=https://npm.pkg.github.com
```

## Usage

### Configure

Call `configure` once before making any requests. `baseUrl` is required; all other options are optional.

```typescript
import { configure } from '@ddproxy/registry-client'

configure({
  baseUrl: 'https://your-registry-host.com/path/to/registry/',
  cache: true,          // default: true
  cacheTTL: 5 * 60 * 1000, // default: 5 minutes
})
```

### Fetch registry data

```typescript
import { getRegistryIndex, getProject, getProjects, getVersions, getVersion } from '@ddproxy/registry-client'

// Full list of project slugs
const index = await getRegistryIndex()

// All project metadata records
const projects = await getProjects()

// Single project
const project = await getProject('my-project')

// All versions for a project
const versions = await getVersions('my-project')

// Specific version
const version = await getVersion('my-project', 'v1.0.0')
```

### Error handling

```typescript
import { RegistryNotFoundError, RegistryFetchError, RegistryConfigurationError } from '@ddproxy/registry-client'

try {
  const project = await getProject('unknown')
} catch (err) {
  if (err instanceof RegistryNotFoundError) {
    // 404 — project doesn't exist
  } else if (err instanceof RegistryFetchError) {
    // non-404 HTTP error — err.status, err.url
  } else if (err instanceof RegistryConfigurationError) {
    // configure() was not called or baseUrl is empty
  }
}
```

### Cache control

```typescript
import { cacheClear } from '@ddproxy/registry-client'

cacheClear() // invalidate all cached entries
```

## API

| Export | Type | Description |
|--------|------|-------------|
| `configure(config)` | `(RegistryClientConfig) => void` | Set base URL and cache options |
| `getConfig()` | `() => Required<RegistryClientConfig>` | Read current config |
| `getRegistryIndex()` | `() => Promise<RegistryIndex>` | Fetch `index.json` |
| `getProjects()` | `() => Promise<ProjectMetadata[]>` | Fetch all project records |
| `getProject(name)` | `(string) => Promise<ProjectMetadata>` | Fetch one project record |
| `getVersions(name)` | `(string) => Promise<VersionMetadata[]>` | Fetch version index for a project |
| `getVersion(name, version)` | `(string, string) => Promise<VersionMetadata>` | Fetch one version record |
| `cacheClear()` | `() => void` | Clear in-memory cache |

## Types

```typescript
interface RegistryClientConfig {
  baseUrl?: string
  cache?: boolean
  cacheTTL?: number
}

interface RegistryIndex {
  projects: string[]
}

interface ProjectMetadata {
  name: string
  displayName: string
  description: string
  tags: string[]
  repo: { github?: string; gitea?: string; [key: string]: string | undefined }
  latestVersion: string
  license: string
}

interface VersionMetadata {
  version: string
  date: string
  changelog: string[]
  assets: Record<string, string[]>
  repoLinks: { githubTag?: string; giteaTag?: string; [key: string]: string | undefined }
  license: string
}
```

## Registry file structure

```
index.json
projects/
  {slug}.json
  {slug}/
    versions/
      index.json
      {version}.json
```

## Development

```bash
npm ci          # install dependencies
npm run build   # compile TypeScript
npm test        # run tests with coverage
npm run type-check
```

Coverage threshold is enforced at 80% across branches, functions, lines, and statements.

## License

MIT — Copyright (c) 2026 Jon West
