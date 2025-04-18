import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db/drizzle"
import { environments, repos } from "@/lib/db/schema"
import { createEnv, createEnvCliArgs, dockerPull } from "@/lib/docker/utils"
import { toolCall, ToolCallResult } from "@/lib/mcp/utils"
import { ToolCallRequestSchema, ToolCallResponseSchemaType } from "@/lib/schema/server"
import { ApiResponse } from "@/app/api/types"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ repokey: string[] }> }
) {
  try {
    const repoKeyArr = (await params).repokey

    if (!Array.isArray(repoKeyArr)) {
      return NextResponse.json(ApiResponse.error("Invalid repokey"), { status: 400 })
    }

    const body = await req.json()

    const parsed = ToolCallRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(ApiResponse.error("Invalid request body"), { status: 400 })
    }

    const repoKey = repoKeyArr.join("/")

    const foundRepository = await db.query.repos.findFirst({
      where: eq(repos.repoKey, repoKey),
      with: {
        servers: true,
      },
    })

    if (!foundRepository) {
      return NextResponse.json(ApiResponse.error("Repository not found"), { status: 404 })
    }

    const tag = foundRepository.servers.tag

    if (!tag) {
      return NextResponse.json(ApiResponse.error("Server tag not found"), { status: 404 })
    }

    await dockerPull(tag)

    const envs = await db.query.environments.findMany({
      where: eq(environments.serverId, foundRepository.servers.id),
    })

    const mappedEnvs = envs.map((env) => ({ key: env.key, value: env.value }))

    let toolCallResult: ToolCallResult = []
    if (foundRepository.servers.transportType === "stdio") {
      toolCallResult = await toolCall({
        type: "stdio",
        command: "docker",
        args: ["run", "-i", "--rm", ...createEnvCliArgs(mappedEnvs), tag],
        env: createEnv(mappedEnvs),
        params: {
          name: parsed.data.toolName,
          arguments: parsed.data.arguments,
        },
      })
    } else {
      // TODO: sse는 현재 고려 안함
      //
      // sse 배포 시나리오가 들어간다면 여기에 추가
      // const deploymentUrl = deployments.url
      // const sseUrl = `${deploymentUrl}/sse`
      //
      // const port = await dockerRun(tag)
      // toolResult = await toolCall({
      //   type: "sse",
      //   url: `http://localhost:${port}/sse`,
      //   params: {
      //     name: parsed.data.toolName,
      //     arguments: parsed.data.arguments,
      //   },
      // })
    }

    const response: ToolCallResponseSchemaType = {
      result: toolCallResult,
    }

    return NextResponse.json(ApiResponse.success(response))
  } catch (error) {
    console.error("Error tool call:", error)

    let errorMessage = "Internal Server Error"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(ApiResponse.error(errorMessage), { status: 500 })
  }
}
