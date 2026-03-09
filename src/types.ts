export interface RegistryIndex {
  projects: string[]
}

export interface ProjectMetadata {
  name: string
  displayName: string
  description: string
  tags: string[]
  repo: {
    github?: string
    gitea?: string
    [key: string]: string | undefined
  }
  latestVersion: string
  license: string
}

export interface VersionMetadata {
  version: string
  date: string
  changelog: string[]
  assets: Record<string, string[]>
  repoLinks: {
    githubTag?: string
    giteaTag?: string
    [key: string]: string | undefined
  }
  license: string
}

export interface RegistryClientConfig {
  baseUrl?: string
  cache?: boolean
  cacheTTL?: number
}
