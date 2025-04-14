import fsPromises from "node:fs/promises"
import path from "node:path"
import chalk from "chalk"

import {
  executeCommand,
  existsLocalRepo,
  existsRemoteRepo,
  getCloneDir,
  getRepoUrl,
  removeLocalRepo,
} from "./utils"

export async function deploy(ownerName: string, repoName: string) {
  const repoUrl = getRepoUrl({ registry: "github", owner: ownerName, repo: repoName })
  const cloneDir = await getCloneDir(repoName)

  console.log(`${chalk.green("check")} ${repoUrl} exists...`)
  const isExistsRepo = await existsRemoteRepo(repoUrl)
  if (!isExistsRepo) {
    throw new Error(`${repoUrl} not found`)
  }
  console.log(`${chalk.green("check")} ${repoUrl} exists done`)

  console.log(`${chalk.green("check")} ${cloneDir} exists...`)
  const isExistsLocalRepo = await existsLocalRepo(repoName)
  if (isExistsLocalRepo) {
    console.log(`${chalk.green("check")} ${cloneDir} exists done`)
    await removeLocalRepo(repoName)
  }

  console.log(`${chalk.green("git")} ${chalk.cyan("clone")} ${repoUrl} ${cloneDir}...`)
  await executeCommand("git", ["clone", repoUrl, cloneDir])
  console.log(`${chalk.green("git")} ${chalk.cyan("clone")} ${repoUrl} ${cloneDir} done`)

  console.log(`${chalk.green("check")} ${cloneDir}/Dockerfile exists...`)
  const hasDockerfile = await fsPromises.stat(path.join(cloneDir, "Dockerfile"))
  if (!hasDockerfile) {
    throw new Error(`${cloneDir}/Dockerfile not found`)
  }
  console.log(`${chalk.green("check")} ${cloneDir}/Dockerfile exists done`)

  const dockerDomain = "core.harbor.domain/app"
  const tag = `${dockerDomain}/mcp-registry:latest`
  console.log(`${chalk.green("docker")} ${chalk.cyan("build")} ${tag} from ${cloneDir}...`)
  await executeCommand("docker", ["build", "-t", tag, cloneDir])
  console.log(`${chalk.green("docker")} ${chalk.cyan("build")} ${tag} done`)

  console.log(`${chalk.green("docker")} ${chalk.cyan("push")} ${tag}...`)
  await executeCommand("docker", ["push", tag])
  console.log(`${chalk.green("docker")} ${chalk.cyan("push")} ${tag} done`)

  console.log(`${chalk.green("remove")} ${cloneDir}...`)
  await removeLocalRepo(repoName)
  console.log(`${chalk.green("remove")} ${cloneDir} done`)
}

// test
// console.log(`${chalk.green("start")} ${chalk.cyan("deploy")}...\n`)
// await deploy("JHSeo-git", "my-first-mcp").catch((err) => {
//   console.error(err)
//   process.exit(1)
// })
// console.log(`\n${chalk.green("deploy")} ${chalk.cyan("done")}`)
