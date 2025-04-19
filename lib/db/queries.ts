import { eq } from "drizzle-orm"

import { db } from "./drizzle"
import { tools } from "./schema"
import { genenerateUUID } from "./utils"

interface CreateToolsOptions {
  tools: {
    name: string
    description?: string | null
    inputSchema: unknown
  }[]
  serverId: string
}
export async function createTools(options: CreateToolsOptions) {
  if (options.tools.length === 0) {
    return []
  }

  await db.delete(tools).where(eq(tools.serverId, options.serverId))

  return await db.insert(tools).values(
    options.tools.map((tool) => ({
      id: genenerateUUID(),
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      serverId: options.serverId,
      createdBy: "SYSTEM",
    }))
  )
}
