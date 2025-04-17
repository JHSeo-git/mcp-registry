import { NextRequest, NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"

import { db } from "@/lib/db/drizzle"
import { deployments, repos } from "@/lib/db/schema"
import { DeploymentsResponseSchemaType } from "@/lib/schema/deployment"
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
      .where(eq(repos.repoKey, repoKey))
      .orderBy(desc(deployments.updatedAt))

    if (!foundDeployments) {
      return NextResponse.json(ApiResponse.error("Deployment not found"), { status: 404 })
    }

    const response: DeploymentsResponseSchemaType = {
      deployments: foundDeployments.map(({ deployments, repos }) => ({
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
