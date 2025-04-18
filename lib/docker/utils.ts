import path from "node:path"
import getPort, { portNumbers } from "get-port"

import { Env } from "../env"
import { EnvironmentSchemaType } from "../schema/deployment"
import { executeCommand } from "../terminal/utils"

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
  const tag =
    `${Env.DOCKER_DOMAIN}/${await getTagRepo(baseDirectory, ownerName, repoName)}:latest`.toLowerCase()
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
  return tag
}

export async function dockerPull(tag: string) {
  await executeCommand("docker", ["pull", tag])
}

export async function dockerRun(tag: string) {
  const port = await getPort({ port: portNumbers(8000, 9000) })
  await executeCommand("docker", ["run", "--rm", "-p", `${port}:8000`, tag])
  return port
}

export function createEnvCliArgs(envs: EnvironmentSchemaType[]) {
  if (envs.length === 0) {
    return [""]
  }

  return envs.map((env) => ["-e", `${env.key}`]).flat()
}

export function createEnv(envs: EnvironmentSchemaType[]) {
  return envs.reduce(
    (acc, env) => {
      acc[env.key] = env.value
      return acc
    },
    {} as Record<string, string>
  )
}
