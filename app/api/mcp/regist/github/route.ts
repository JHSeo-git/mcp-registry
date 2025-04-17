import path from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { eq, sql } from "drizzle-orm"

import { db } from "@/lib/db/drizzle"
import { deployments, DeploymentStatus, repos } from "@/lib/db/schema"
import { genenerateUUID } from "@/lib/db/utils"
import {
  checkFileExists,
  executeCommand,
  existsLocalRepo,
  getCloneDir,
  removeLocalRepo,
} from "@/lib/deploy/utils"
import { dockerBuildAndPush, dockerLogin } from "@/lib/docker/utils"
import { getRepository } from "@/lib/github"
import { GithubRegistRequestSchema, GithubRegistResponseSchemaType } from "@/lib/schema/regist"
import { ApiResponse } from "@/app/api/types"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const parsed = GithubRegistRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  try {
    const { repoKey, owner, repo, baseDirectory } = parsed.data

    const githubRepository = await getRepository(owner, repo)

    const deploymentId = await deploy({
      repoKey,
      ownerName: owner,
      repoName: repo,
      baseDirectory,
    })

    const response: GithubRegistResponseSchemaType = {
      repoKey,
      owner,
      repo: githubRepository.name,
      deploymentId,
    }

    return NextResponse.json(ApiResponse.success(response))
  } catch (error) {
    console.error("/api/mcp/regist/github Error:", error)

    let errorMessage = "Internal Server Error"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(ApiResponse.error(errorMessage), { status: 500 })
  }
}

interface DeployOptions {
  repoKey: string
  ownerName: string
  repoName: string
  baseDirectory: string
}
async function deploy({ repoKey, ownerName, repoName, baseDirectory }: DeployOptions) {
  const githubRepository = await getRepository(ownerName, repoName)

  const cloneUrl = githubRepository.clone_url
  const cloneDir = await getCloneDir(repoName)

  let repository = await db.query.repos.findFirst({
    where: eq(repos.repoKey, repoKey),
  })

  if (!repository) {
    const inserted = await db
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

    if (!inserted || inserted.length === 0) {
      throw new Error("Failed to insert repository")
    }

    repository = inserted[0]
  }

  const inserted = await db
    .insert(deployments)
    .values({
      id: genenerateUUID(),
      status: "PENDING",
      commit: githubRepository.headSha,
      branch: githubRepository.default_branch,
      commitMessage: githubRepository.commitMessage,
      logs: "Starting regist...",
      repoId: repository.id,
      createdBy: "SYSTEM",
    })
    .returning()

  if (!inserted || inserted.length === 0) {
    throw new Error("Failed to insert deployment")
  }

  const deployment = inserted[0]

  const isExistsLocalRepo = await existsLocalRepo(repoName)
  if (isExistsLocalRepo) {
    await removeLocalRepo(repoName)
  }

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
      await dockerBuildAndPush(cloneDir, baseDirectory, ownerName, repoName)

      await removeLocalRepo(repoName)

      await updateLogs(deploymentId, `Deploy docker image successful!`, "SUCCESS")
    } catch (error) {
      console.error(error)

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
