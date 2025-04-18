import { z } from "zod"

import { ToolCallContentSchema } from "../mcp/schema"

export const TransportTypeSchema = z.enum(["stdio", "sse"], {
  message: "Transport type is required",
})
export type TransportTypeSchemaType = z.infer<typeof TransportTypeSchema>

export const ToolCallRequestSchema = z.object({
  toolName: z.string(),
  arguments: z.any(),
})
export type ToolCallRequestSchemaType = z.infer<typeof ToolCallRequestSchema>

export const ToolCallResponseSchema = z.object({
  result: ToolCallContentSchema,
})
export type ToolCallResponseSchemaType = z.infer<typeof ToolCallResponseSchema>
