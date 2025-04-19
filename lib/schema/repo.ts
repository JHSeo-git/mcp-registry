import { z } from "zod"

export const RepositorySchema = z.object({
  registry: z.string(),
  repoKey: z.string(),
  baseDirectory: z.string(),
  id: z.string(),
  name: z.string(),
  project: z.string(),
  url: z.string(),
})

export type RepositorySchemaType = z.infer<typeof RepositorySchema>

export const RepositoriesResponseSchema = z.object({
  repositories: z.array(RepositorySchema),
})

export type RepositoriesResponseSchemaType = z.infer<typeof RepositoriesResponseSchema>

export const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  inputSchema: z.unknown(),
})

export type ToolSchemaType = z.infer<typeof ToolSchema>

export const RepositoryServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
})

export type RepositoryServerSchemaType = z.infer<typeof RepositoryServerSchema>

export const RepositoryResponseSchema = z.object({
  id: z.string(),
  repoKey: z.string(),
  registry: z.string(),
  project: z.string(),
  name: z.string(),
  url: z.string(),
  server: RepositoryServerSchema.nullable(),
  tools: z.array(ToolSchema),
})

export type RepositoryResponseSchemaType = z.infer<typeof RepositoryResponseSchema>
