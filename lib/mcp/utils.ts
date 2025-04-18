import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js"
import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"

import { ToolCallContentSchema } from "./schema"

type ToolCallOptions =
  | {
      type: "stdio"
      command: string
      args?: string[]
      env?: Record<string, string>
      params: CallToolRequest["params"]
    }
  | {
      type: "sse"
      url: string
      params: CallToolRequest["params"]
    }
export async function toolCall(options: ToolCallOptions) {
  try {
    if (options.type === "stdio") {
      return toolCallStdio(options.params, options.command, options.args, options.env)
    }

    if (options.type === "sse") {
      return toolCallSSE(options.params, options.url)
    }
  } catch (error) {
    console.error("toolCall failed", error)
    throw error
  }
  throw new Error("Invalid transport type")
}
export type ToolCallResult = Awaited<ReturnType<typeof toolCall>>

async function toolCallStdio(
  params: CallToolRequest["params"],
  command: string,
  args: string[] = [],
  env?: Record<string, string>
) {
  let client: Client | undefined = undefined
  let isConnection = false
  try {
    client = await createStdioClient(command, args.filter(Boolean), env)
    isConnection = true
    const result = await client.callTool(params)
    const parsed = ToolCallContentSchema.safeParse(result.content)
    if (!parsed.success) {
      throw new Error("Invalid tool call result")
    }
    return parsed.data
  } catch (error) {
    throw error
  } finally {
    if (isConnection) {
      await close(client)
    }
  }
}

async function toolCallSSE(params: CallToolRequest["params"], url: string) {
  let client: Client | undefined = undefined
  let isConnection = false
  try {
    const parsedUrl = z.string().url().safeParse(url)

    if (!parsedUrl.success) {
      throw new Error("Invalid URL")
    }

    client = await createSSEClient(parsedUrl.data)
    isConnection = true
    const result = await client.callTool(params)
    const parsed = ToolCallContentSchema.safeParse(result.content)
    if (!parsed.success) {
      throw new Error("Invalid tool call result")
    }
    return parsed.data
  } catch (error) {
    throw error
  } finally {
    if (isConnection) {
      await close(client)
    }
  }
}

async function createStdioClient(command: string, args: string[], env?: Record<string, string>) {
  const client = new Client({
    name: "mcp-registry-stdio-client",
    version: "1.0.0",
  })

  const stdioEnv = {
    ...env,
    ...getDefaultEnvironment(),
  }
  const stdioClientTransport = new StdioClientTransport({ command, args, env: stdioEnv })
  await client.connect(stdioClientTransport)

  return client
}

async function createSSEClient(url: string) {
  const client = new Client({
    name: "mcp-registry-sse-client",
    version: "1.0.0",
  })

  const sseClientTransport = new SSEClientTransport(new URL(url))
  await client.connect(sseClientTransport)

  return client
}

type ToolListOptions =
  | {
      type: "stdio"
      command: string
      args?: string[]
      env?: Record<string, string>
    }
  | {
      type: "sse"
      url: string
    }
export async function toolList(options: ToolListOptions) {
  try {
    if (options.type === "stdio") {
      return toolListStdio(options.command, options.args, options.env)
    }

    if (options.type === "sse") {
      return toolListSSE(options.url)
    }
  } catch (error) {
    console.error("toolList failed", error)
    // tool list failed, return empty array
    return []
  }
  throw new Error("Invalid transport type")
}
export type ToolListResult = Awaited<ReturnType<typeof toolList>>

async function toolListStdio(command: string, args: string[] = [], env?: Record<string, string>) {
  let client: Client | undefined = undefined
  let isConnection = false
  try {
    client = await createStdioClient(command, args.filter(Boolean), env)
    isConnection = true
    const result = await client.listTools()
    return result.tools
  } catch (error) {
    throw error
  } finally {
    if (isConnection) {
      await close(client)
    }
  }
}

async function toolListSSE(url: string) {
  let client: Client | undefined = undefined
  let isConnection = false
  try {
    const parsedUrl = z.string().url().safeParse(url)

    if (!parsedUrl.success) {
      throw new Error("Invalid URL")
    }

    client = await createSSEClient(parsedUrl.data)
    isConnection = true
    const result = await client.listTools()
    return result.tools
  } catch (error) {
    throw error
  } finally {
    if (isConnection) {
      await close(client)
    }
  }
}

async function close(client?: Client) {
  try {
    if (client) {
      await client.close()
    }
  } catch (error) {
    console.error("client close error", error)
  }
}

// console.log(await toolList("http://localhost:8181/sse"))
// console.log(await toolList("docker", ["run", "-i", "--rm", "my-first-mcp-stdio"]))
// console.log(
//   await toolCall({
//     type: "stdio",
//     command: "docker",
//     args: ["run", "-i", "--rm", "my-first-mcp-stdio"],
//     params: {
//       name: "calculate-bmi",
//       arguments: {
//         heightM: 123,
//         weightKg: 123,
//       },
//     },
//   })
// )
