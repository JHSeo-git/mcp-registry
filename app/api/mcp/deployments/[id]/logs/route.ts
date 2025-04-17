import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db/drizzle"
import { deployments } from "@/lib/db/schema"
import { DeploymentLogsResponseSchemaType } from "@/lib/schema/deployment"
import { ApiResponse } from "@/app/api/types"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const deploymentId = (await params).id

    const deployment = await db.query.deployments.findFirst({
      where: eq(deployments.id, deploymentId),
      columns: {
        id: true,
        commit: true,
        commitMessage: true,
        branch: true,
        logs: true,
        status: true,
        updatedAt: true,
      },
    })

    if (!deployment) {
      return NextResponse.json(ApiResponse.error("Deployment not found"), { status: 404 })
    }

    const response: DeploymentLogsResponseSchemaType = {
      id: deployment.id,
      commit: deployment.commit,
      commitMessage: deployment.commitMessage,
      branch: deployment.branch,
      logs: deployment.logs ?? "",
      status: deployment.status,
      updatedAt: deployment.updatedAt.toISOString(),
    }

    return NextResponse.json(ApiResponse.success(response))
  } catch (error) {
    console.error("Error fetching deployment logs:", error)

    let errorMessage = "Internal Server Error"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(ApiResponse.error(errorMessage), { status: 500 })
  }
}
