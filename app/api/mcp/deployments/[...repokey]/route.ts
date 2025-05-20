import { NextRequest, NextResponse } from "next/server"
import { desc, eq, inArray } from "drizzle-orm"

import { db } from "@/lib/db/drizzle"
import { deployments, environments, repos, servers } from "@/lib/db/schema"
import { DeploymentsResponseSchemaType } from "@/lib/schema/deployment"
import { TransportTypeSchemaType } from "@/lib/schema/server"
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

    const foundDeployments = await db
      .select()
      .from(deployments)
      .innerJoin(repos, eq(deployments.repoId, repos.id))
      .innerJoin(servers, eq(deployments.serverId, servers.id))
      .where(eq(repos.repoKey, repoKey))
      .orderBy(desc(deployments.updatedAt))

    if (!foundDeployments) {
      return NextResponse.json(ApiResponse.error("Deployment not found"), { status: 404 })
    }

    const foundEnvs = await db.query.environments.findMany({
      where: inArray(
        environments.serverId,
        Array.from(new Set(foundDeployments.map(({ servers }) => servers.id)))
      ),
    })

    const response: DeploymentsResponseSchemaType = {
      deployments: foundDeployments.map(({ deployments, repos, servers }) => ({
        id: deployments.id,
        commit: deployments.commit,
        commitMessage: deployments.commitMessage,
        status: deployments.status,
        branch: deployments.branch,
        logs: deployments.logs ?? "",
        updatedAt: deployments.updatedAt.toISOString(),
        repoKey: repos.repoKey,
        project: repos.project,
        name: repos.name,
        baseDirectory: repos.baseDirectory,
        transportType: servers.transportType as TransportTypeSchemaType,
        commandType: servers.commandType,
        command: servers.command ?? undefined,
      })),
      envs: foundEnvs.map(({ key }) => ({
        key,
      })),
    }

    return NextResponse.json(ApiResponse.success(response))
  } catch (error) {
    console.error("Error fetching deployments:", error)

    let errorMessage = "Internal Server Error"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(ApiResponse.error(errorMessage), { status: 500 })
  }
}
