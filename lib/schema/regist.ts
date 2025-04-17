import { z } from "zod"

export const GithubRegistSchema = z.object({
  repoKeyPostfix: z.string().min(1, { message: "Repository key postfix is required" }),
  owner: z.string().min(1, { message: "Owner is required" }),
  repo: z.string().min(1, { message: "Repository is required" }),
  baseDirectory: z.string().min(1, { message: "Base directory is required" }),
})
export type GithubRegistSchemaType = z.infer<typeof GithubRegistSchema>

export const GithubRegistRequestSchema = z.object({
  repoKey: z.string().min(1, { message: "Repository key is required" }),
  owner: z.string().min(1, { message: "Owner is required" }),
  repo: z.string().min(1, { message: "Repository is required" }),
  baseDirectory: z.string().min(1, { message: "Base directory is required" }),
})
export type GithubRegistRequestSchema = z.infer<typeof GithubRegistRequestSchema>

export const GithubRegistResponseSchema = z.object({
  repoKey: z.string().min(1, { message: "Repository key is required" }),
  owner: z.string().min(1, { message: "Owner is required" }),
  repo: z.string().min(1, { message: "Repository is required" }),
  deploymentId: z.string().min(1, { message: "Deployment ID is required" }),
})
export type GithubRegistResponseSchemaType = z.infer<typeof GithubRegistResponseSchema>
