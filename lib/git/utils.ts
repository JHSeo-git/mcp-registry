interface GetPublicRepoUrlOptions {
  registry: string
  owner: string
  repo: string
}
export const getPublicRepoUrl = ({ registry, owner, repo }: GetPublicRepoUrlOptions) => {
  switch (registry.toLowerCase()) {
    case "github":
      return `https://github.com/${owner}/${repo}.git`
    default:
      throw new Error(`Invalid registry: ${registry}`)
  }
}

interface GetPrivateRepoUrlOptions {
  project: string
  repo: string
}
export const getPrivateRepoUrl = ({ project, repo }: GetPrivateRepoUrlOptions) => {
  return `https://wire.lgcns.com/bitbucket/scm/${project}/${repo}.git`
}
