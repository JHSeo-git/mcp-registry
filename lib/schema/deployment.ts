import { z } from "zod"

import { deploymentStatusEnum } from "../db/schema"
import { TransportTypeSchema } from "./server"

export const DeploymentStatusSchema = z.enum(deploymentStatusEnum.enumValues)

export const DeploymentSchema = z.object({
  id: z.string(),
  commit: z.string(),
  commitMessage: z.string().nullable(),
  status: DeploymentStatusSchema,
  branch: z.string(),
  logs: z.string(),
  repoKey: z.string(),
  updatedAt: z.string(),
  project: z.string(),
  name: z.string(),
  baseDirectory: z.string(),
  transportType: TransportTypeSchema,
})

export type DeploymentSchemaType = z.infer<typeof DeploymentSchema>

export const EnvironmentSchema = z.object({
  key: z.string(),
  value: z.string(),
})

export type EnvironmentSchemaType = z.infer<typeof EnvironmentSchema>

export const DeploymentsResponseSchema = z.object({
  deployments: z.array(DeploymentSchema),
  envs: z.array(EnvironmentSchema),
})

export type DeploymentsResponseSchemaType = z.infer<typeof DeploymentsResponseSchema>

export const DeploymentLogsResponseSchema = z.object({
  id: z.string(),
  commit: z.string(),
  commitMessage: z.string().nullable(),
  branch: z.string(),
  logs: z.string(),
  status: DeploymentStatusSchema,
  updatedAt: z.string(),
})

export type DeploymentLogsResponseSchemaType = z.infer<typeof DeploymentLogsResponseSchema>
