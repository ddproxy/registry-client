# Project Registry Client

A TypeScript client for interacting with a project registry. This client provides easy access to project metadata, version information, and registry indices.

## Purpose

The `registry-client` is designed to simplify the process of fetching and consuming data from a project registry, typically hosted as a set of JSON files. It handles configuration, fetching, and basic caching of registry resources.

## Installation

```bash
npm install @ddproxy/registry-client
```

## Usage

### Configuration

You must configure the client with the base URL of your project registry. You can also adjust caching settings.

```typescript
import { configure } from '@ddproxy/registry-client';

configure({
  baseUrl: 'https://your-project-registry.com/',
  cache: true,
  cacheTTL: 10 * 60 * 1000, // 10 minutes
});
```

### Fetching Data

The client provides several functions to fetch different parts of the registry.

```typescript
import { 
  getRegistryIndex, 
  getProject, 
  getVersions, 
  getVersion 
} from '@ddproxy/registry-client';

async function example() {
  // Get the main registry index
  const index = await getRegistryIndex();
  console.log('Projects:', index.projects);

  // Get metadata for a specific project
  const project = await getProject('my-project');
  console.log('Project Metadata:', project);

  // Get all versions for a project
  const versions = await getVersions('my-project');
  console.log('Versions:', versions);

  // Get specific version metadata
  const version = await getVersion('my-project', '1.0.0');
  console.log('Version Detail:', version);
}
```

### Error Handling

The client throws specific errors for common issues.

```typescript
import { RegistryNotFoundError, RegistryFetchError } from '@ddproxy/registry-client';

try {
  const project = await getProject('non-existent');
} catch (error) {
  if (error instanceof RegistryNotFoundError) {
    console.error('Project not found');
  } else if (error instanceof RegistryFetchError) {
    console.error('Failed to fetch from registry:', error.message);
  }
}
```

## Registry Structure

The `registry-client` expects the project registry to follow a specific directory and file structure, typically hosted as static JSON files.

### Directory Layout
```text
/
├── index.json                     # RegistryIndex
└── projects/
    ├── project-a.json             # ProjectMetadata
    ├── project-b.json             # ProjectMetadata
    └── project-a/
        └── versions/
            ├── index.json         # VersionMetadata[]
            ├── v1.0.0.json        # VersionMetadata
            └── v1.1.0.json        # VersionMetadata
```

### Data Models

#### `RegistryIndex` (`index.json`)
The main entry point for the registry.
- `projects`: An array of project names (slugs) available in the registry.

#### `ProjectMetadata` (`projects/{name}.json`)
Contains high-level information about a project.
- `name`: The project slug.
- `displayName`: The human-readable name of the project.
- `description`: A brief description of the project.
- `tags`: An array of strings for categorization.
- `repo`: An object containing repository links (e.g., `github`, `gitea`).
- `latestVersion`: The string representing the latest stable version.
- `license`: The license type (e.g., "MIT").

#### `VersionMetadata` (`projects/{name}/versions/{version}.json` or `index.json`)
Contains detailed information about a specific version or a list of all versions.
- `version`: The version string (e.g., "v1.0.0").
- `date`: The release date.
- `changelog`: An array of strings describing changes.
- `assets`: A record where keys are asset types (e.g., "source", "binary") and values are arrays of download URLs.
- `repoLinks`: An object containing repository-specific links for this version (e.g., `githubTag`, `giteaTag`).
- `license`: The license for this specific version.

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Type Check

```bash
npm run type-check
```
