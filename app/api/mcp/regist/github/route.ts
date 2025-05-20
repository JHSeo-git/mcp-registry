import path from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { eq, sql } from "drizzle-orm"
import title from "title"

import { db } from "@/lib/db/drizzle"
import { createTools } from "@/lib/db/queries"
import { deployments, DeploymentStatus, environments, repos, servers } from "@/lib/db/schema"
import { genenerateUUID } from "@/lib/db/utils"
import {
  createEnvCliArgs,
  createEnvOnlyKey,
  dockerBuildAndPush,
  dockerLogin,
} from "@/lib/docker/utils"
import { getRepository } from "@/lib/github"
import { toolList, ToolListResult } from "@/lib/mcp/utils"
import { DeploymentEnvironmentSchemaType } from "@/lib/schema/deployment"
import { GithubRegistRequestSchema, GithubRegistResponseSchemaType } from "@/lib/schema/regist"
import {
  checkFileExists,
  executeCommand,
  existsLocalRepo,
  getCloneDir,
  removeLocalRepo,
} from "@/lib/terminal/utils"
import { ApiResponse } from "@/app/api/types"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const parsed = GithubRegistRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(ApiResponse.error("Invalid request body"), { status: 400 })
  }

  // TODO: sse 는 추후 고려
  if (parsed.data.transportType === "sse") {
    return NextResponse.json(ApiResponse.error("SSE is not supported yet"), { status: 400 })
  }

  try {
    const { transportType, repoKey, owner, repo, baseDirectory, envs, commandType, command } =
      parsed.data

    const githubRepository = await getRepository(owner, repo)

    const deploymentId = await deploy({
      transportType,
      repoKey,
      ownerName: owner,
      repoName: repo,
      baseDirectory,
      envs,
      commandType,
      command: command ?? undefined,
    })

    const response: GithubRegistResponseSchemaType = {
      transportType,
      repoKey,
      owner,
      repo: githubRepository.name,
      deploymentId,
    }

    return NextResponse.json(ApiResponse.success(response))
  } catch (error) {
    console.error("Error regist github:", error)

    let errorMessage = "Internal Server Error"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(ApiResponse.error(errorMessage), { status: 500 })
  }
}

interface DeployOptions {
  transportType: "stdio" | "sse"
  repoKey: string
  ownerName: string
  repoName: string
  baseDirectory: string
  envs: DeploymentEnvironmentSchemaType[]
  commandType: string
  command?: string
}
async function deploy({
  transportType,
  repoKey,
  ownerName,
  repoName,
  baseDirectory,
  envs,
  commandType,
  command,
}: DeployOptions) {
  const githubRepository = await getRepository(ownerName, repoName)

  const cloneUrl = githubRepository.clone_url
  const cloneDir = await getCloneDir(repoName)

  let repository = await db.query.repos.findFirst({
    where: eq(repos.repoKey, repoKey),
  })

  if (!repository) {
    const insertedRepositories = await db
      .insert(repos)
      .values({
        id: genenerateUUID(),
        repoKey,
        project: ownerName,
        name: repoName,
        url: cloneUrl,
        baseDirectory,
        registry: "GITHUB",
        createdBy: "SYSTEM",
      })
      .returning()

    if (!insertedRepositories || insertedRepositories.length === 0) {
      throw new Error("Failed to insert repository")
    }

    repository = insertedRepositories[0]
  }

  let server = await db.query.servers.findFirst({
    where: eq(servers.repoId, repository.id),
  })

  if (!server) {
    const insertedServers = await db
      .insert(servers)
      .values({
        id: genenerateUUID(),
        name: getServerName(repository.repoKey),
        // description: "",
        repoId: repository.id,
        transportType,
        commandType,
        command,
        createdBy: "SYSTEM",
      })
      .returning()

    if (!insertedServers || insertedServers.length === 0) {
      throw new Error("Failed to insert server")
    }

    server = insertedServers[0]
  } else {
    if (server.transportType !== transportType) {
      await db
        .update(servers)
        .set({
          transportType,
          updatedBy: "SYSTEM",
        })
        .where(eq(servers.id, server.id))
    }
  }

  const insertedDeployments = await db
    .insert(deployments)
    .values({
      id: genenerateUUID(),
      status: "PENDING",
      commit: githubRepository.headSha,
      branch: githubRepository.default_branch,
      commitMessage: githubRepository.commitMessage,
      logs: "Starting regist...",
      repoId: repository.id,
      serverId: server.id,
      createdBy: "SYSTEM",
    })
    .returning()

  if (!insertedDeployments || insertedDeployments.length === 0) {
    throw new Error("Failed to insert deployment")
  }

  const deployment = insertedDeployments[0]

  const isExistsLocalRepo = await existsLocalRepo(repoName)
  if (isExistsLocalRepo) {
    await removeLocalRepo(repoName)
  }

  await db.delete(environments).where(eq(environments.serverId, server.id))
  const insertedEnvs =
    envs.length > 0
      ? await db
          .insert(environments)
          .values(
            envs.map((env) => ({
              id: genenerateUUID(),
              key: env.key,
              serverId: server.id,
              createdBy: "SYSTEM",
            }))
          )
          .returning()
      : []

  // 비동기 수행
  new Promise(async () => {
    const deploymentId = deployment.id

    try {
      await executeCommand("git", ["clone", cloneUrl, cloneDir])
      await updateLogs(deploymentId, `Successfully obtained required file`, "IN_PROGRESS")

      await updateLogs(deploymentId, `Docker build prepare...`, "IN_PROGRESS")
      const dockerfilePath = path.join(cloneDir, baseDirectory, "Dockerfile")

      const hasDockerfile = await checkFileExists(dockerfilePath)
      if (!hasDockerfile) {
        throw new Error(`${path.join(baseDirectory, "Dockerfile")} not found`)
      }

      await dockerLogin()
      await updateLogs(deploymentId, `Docker Registry Connect Success!`, "IN_PROGRESS")

      await updateLogs(deploymentId, `Building Docker image...`, "IN_PROGRESS")
      const tag = await dockerBuildAndPush(cloneDir, baseDirectory, ownerName, repoName)
      await db.update(servers).set({ tag, updatedBy: "SYSTEM" }).where(eq(servers.id, server.id))

      await updateLogs(deploymentId, `Generate a mcp metadata...`, "IN_PROGRESS")
      let toolListResult: ToolListResult = []
      if (transportType === "stdio") {
        toolListResult = await toolList({
          type: "stdio",
          command: "docker",
          args: ["run", "-i", "--rm", ...createEnvCliArgs(insertedEnvs), tag],
          env: createEnvOnlyKey(insertedEnvs),
        })
      } else {
        // TODO: sse는 현재 고려 안함
        //
        // sse 배포 시나리오가 들어간다면 여기에 추가
        // await updateLogs(deploymentId, `Deploy MCP Server...`, "IN_PROGRESS")
        // const deploymentUrl = ""
        // const sseUrl = `${deploymentUrl}/sse`
        //
        // const port = await dockerRun(tag)
        // const sseUrl = `http://localhost:${port}/sse`
        // tools = await toolList({
        //   type: "sse",
        //   url: sseUrl,
        // })
      }
      await createTools({
        tools: toolListResult.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
        serverId: server.id,
      })

      await removeLocalRepo(repoName)

      await updateLogs(deploymentId, `Deploy docker image successful!`, "SUCCESS")
    } catch (error) {
      console.error("Error deploy github:", error)

      if (error instanceof Error) {
        if (deploymentId) {
          await updateLogs(deploymentId, error.message + `\nDeploy failed!`, "FAILED")
        }
      }

      throw error
    }
  })

  return deployment.id
}

async function updateLogs(deploymentId: string, logs: string, status?: DeploymentStatus) {
  const logsWithNewLine = `\n${logs}`
  await db
    .update(deployments)
    .set({
      ...(status && { status }),
      logs: sql<string>`${deployments.logs} || ${logsWithNewLine}`,
      updatedBy: "SYSTEM",
    })
    .where(eq(deployments.id, deploymentId))
}

function getServerName(repoKey: string) {
  const serverName = path.basename(repoKey)

  const cleanedServerName = serverName.replaceAll("-", " ")
  return title(cleanedServerName, { special: ["MCP"] })
}
