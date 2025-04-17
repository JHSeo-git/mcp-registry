import { NextRequest, NextResponse } from "next/server"

import { db } from "@/lib/db/drizzle"
import { RepositoriesResponseSchemaType } from "@/lib/schema/repo"
import { ApiResponse } from "@/app/api/types"

export async function GET(req: NextRequest) {
  try {
    const repos = await db.query.repos.findMany({
      columns: {
        id: true,
        repoKey: true,
        project: true,
        name: true,
        url: true,
        baseDirectory: true,
        registry: true,
      },
    })

    if (!repos) {
      return NextResponse.json(ApiResponse.error("Repos not found"), { status: 404 })
    }

    const response: RepositoriesResponseSchemaType = {
      repositories: repos.map((repo) => ({
        id: repo.id,
        repoKey: repo.repoKey,
        project: repo.project,
        name: repo.name,
        url: repo.url,
        baseDirectory: repo.baseDirectory,
        registry: repo.registry,
      })),
    }

    return NextResponse.json(ApiResponse.success(response))
  } catch (error) {
    console.error("Error fetching repositories:", error)

    let errorMessage = "Internal Server Error"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(ApiResponse.error(errorMessage), { status: 500 })
  }
}
