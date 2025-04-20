import { z } from "zod"

import { DeploymentEnvironmentSchema } from "./deployment"
import { TransportTypeSchema } from "./server"

export const GithubRegistSchema = z.object({
  transportType: TransportTypeSchema,
  repoKeyPostfix: z.string().min(1, { message: "Repository key postfix is required" }),
  owner: z.string().min(1, { message: "Owner is required" }),
  repo: z.string().min(1, { message: "Repository is required" }),
  baseDirectory: z.string().min(1, { message: "Base directory is required" }),
  envs: z.array(DeploymentEnvironmentSchema),
})
export type GithubRegistSchemaType = z.infer<typeof GithubRegistSchema>

export const GithubRegistRequestSchema = z.object({
  transportType: TransportTypeSchema,
  repoKey: z.string().min(1, { message: "Repository key is required" }),
  owner: z.string().min(1, { message: "Owner is required" }),
  repo: z.string().min(1, { message: "Repository is required" }),
  baseDirectory: z.string().min(1, { message: "Base directory is required" }),
  envs: z.array(DeploymentEnvironmentSchema),
})
export type GithubRegistRequestSchema = z.infer<typeof GithubRegistRequestSchema>

export const GithubRegistResponseSchema = z.object({
  transportType: TransportTypeSchema,
  repoKey: z.string().min(1, { message: "Repository key is required" }),
  owner: z.string().min(1, { message: "Owner is required" }),
  repo: z.string().min(1, { message: "Repository is required" }),
  deploymentId: z.string().min(1, { message: "Deployment ID is required" }),
})
export type GithubRegistResponseSchemaType = z.infer<typeof GithubRegistResponseSchema>
