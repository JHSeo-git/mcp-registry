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
