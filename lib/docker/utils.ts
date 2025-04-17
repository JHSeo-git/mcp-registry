import path from "node:path"

import { executeCommand } from "../deploy/utils"
import { Env } from "../env"

export async function getTagRepo(baseDirectory: string, ownerName: string, repoName: string) {
  if (baseDirectory === ".") {
    return path.join(ownerName, repoName)
  }

  return path.join(ownerName, repoName, path.basename(baseDirectory))
}

export async function dockerLogin() {
  const registry = Env.DOCKER_DOMAIN
  const username = Env.DOCKER_USER
  const password = Env.DOCKER_PASSWORD

  await executeCommand("docker", ["login", registry, "-u", username, "--password-stdin"], {
    input: password,
  })
}

export async function dockerBuildAndPush(
  cloneDir: string,
  baseDirectory: string,
  ownerName: string,
  repoName: string
) {
  const tag = `${Env.DOCKER_DOMAIN}/${await getTagRepo(baseDirectory, ownerName, repoName)}:latest`
  const dockerFilePath = path.join(cloneDir, baseDirectory, "Dockerfile")
  try {
    const context = cloneDir
    await executeCommand("docker", ["build", "-t", tag, "-f", dockerFilePath, context])
  } catch {
    // alter
    const context = path.join(cloneDir, baseDirectory)
    await executeCommand("docker", ["build", "-t", tag, "-f", dockerFilePath, context])
  }
  await executeCommand("docker", ["push", tag])
}
