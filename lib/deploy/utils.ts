import { spawn, SpawnOptionsWithoutStdio } from "node:child_process"
import fsPromises from "node:fs/promises"
import path from "node:path"

type GitRegistry = "github" | "gitlab" | "bitbucket"
interface GetRepoUrlOptions {
  registry: GitRegistry
  owner: string
  repo: string
}
export const getRepoUrl = ({ registry, owner, repo }: GetRepoUrlOptions) => {
  switch (registry) {
    case "github":
      return `https://github.com/${owner}/${repo}.git`
    case "gitlab":
      return `https://gitlab.com/${owner}/${repo}.git`
    case "bitbucket":
      return `https://bitbucket.org/${owner}/${repo}.git`
    default:
      throw new Error(`Invalid registry: ${registry}`)
  }
}

interface GetLgcnsRepoUrlOptions {
  project: string
  repo: string
}
export const getLgcnsRepoUrl = ({ project, repo }: GetLgcnsRepoUrlOptions) => {
  return `https://wire.lgcns.com/bitbucket/scm/${project}/${repo}.git`
}

const CLONE_ROOT_DIR = "/tmp/mcp-registry"

export const getCloneDir = async (name: string) => {
  const cloneDir = path.join(CLONE_ROOT_DIR, name)
  await fsPromises.mkdir(cloneDir, { recursive: true })
  return cloneDir
}
export const existsRemoteRepo = async (repo: string) => {
  const isExistsRepo = await fetch(repo).then((res) => res.status === 200)
  return isExistsRepo
}
export const existsLocalRepo = async (repo: string) => {
  const cloneDir = path.join(CLONE_ROOT_DIR, repo)
  const isExistsRepo = await fsPromises.stat(cloneDir)
  return Boolean(isExistsRepo)
}
export const removeLocalRepo = async (repo: string) => {
  const cloneDir = path.join(CLONE_ROOT_DIR, repo)
  await fsPromises.rm(cloneDir, { recursive: true, force: true })
}

export const executeCommand = async (
  command: string,
  args: string[],
  options: SpawnOptionsWithoutStdio = {}
) => {
  const process = spawn(command, args, options)
  try {
    const result = await new Promise((resolve, reject) => {
      process.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`${commandMessage(command, args)} failed`))
          return
        }

        resolve(true)
      })
    })

    if (!result) {
      throw new Error(`${commandMessage(command, args)} failed`)
    }
  } catch (err) {
    throw err
  }
}

const commandMessage = (command: string, args: string[]) => {
  return `${command} ${args.join(" ")}`
}
