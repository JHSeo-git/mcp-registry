import { NextRequest, NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"

import { db } from "@/lib/db/drizzle"
import { deployments, repos, tools } from "@/lib/db/schema"
import { RepositoryResponseSchemaType } from "@/lib/schema/repo"
import { ApiResponse } from "@/app/api/types"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ repokey: string[] }> }
) {
  try {
    const repoKeyArr = (await params).repokey

    if (!Array.isArray(repoKeyArr)) {
      return NextResponse.json(ApiResponse.error("Invalid repokey"), { status: 400 })
    }

    const repoKey = repoKeyArr.join("/")

    const foundRepository = await db.query.repos.findFirst({
      where: eq(repos.repoKey, repoKey),
    })

    if (!foundRepository) {
      return NextResponse.json(ApiResponse.error("Repository not found"), { status: 404 })
    }

    const latestDeployment = await db.query.deployments.findFirst({
      where: eq(deployments.repoId, foundRepository.id),
      orderBy: desc(deployments.createdAt),
      with: {
        servers: true,
      },
    })

    const foundTools = latestDeployment?.servers
      ? await db.query.tools.findMany({
          where: eq(tools.serverId, latestDeployment.servers.id),
        })
      : []

    const response: RepositoryResponseSchemaType = {
      id: foundRepository.id,
      repoKey: foundRepository.repoKey,
      registry: foundRepository.registry,
      name: foundRepository.name,
      project: foundRepository.project,
      url: foundRepository.url,
      server: latestDeployment?.servers
        ? {
            id: latestDeployment.servers.id,
            name: latestDeployment.servers.name,
            description: latestDeployment.servers.description,
          }
        : null,
      tools: foundTools.map((tool) => ({
        id: tool.id,
        name: tool.name,
        inputSchema: tool.inputSchema,
      })),
    }

    return NextResponse.json(ApiResponse.success(response))
  } catch (error) {
    console.error("Error fetching repository:", error)

    let errorMessage = "Internal Server Error"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(ApiResponse.error(errorMessage), { status: 500 })
  }
}
