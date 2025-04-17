import fsPromises from "node:fs/promises"
import path from "node:path"
import { execa, Options } from "execa"

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

export const executeCommand = async (command: string, args: string[], options: Options = {}) => {
  const process = execa(command, args, options)
  try {
    const result = await new Promise((resolve, reject) => {
      process.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`${commandMessage(command, args)} failed`))
          return
        }

        resolve(true)
      })
      process.on("error", (err) => {
        console.error("execa error", err)
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

export async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fsPromises.stat(filePath)
    return true
  } catch {
    return false
  }
}
