import { z } from "zod"

import { DeploymentEnvironmentSchema } from "./deployment"
import { TransportTypeSchema } from "./server"

export const GithubRegistSchema = z
  .object({
    transportType: TransportTypeSchema,
    repoKeyPostfix: z.string().min(1, { message: "Repository key postfix is required" }),
    owner: z.string().min(1, { message: "Owner is required" }),
    repo: z.string().min(1, { message: "Repository is required" }),
    baseDirectory: z.string().min(1, { message: "Base directory is required" }),
    envs: z.array(DeploymentEnvironmentSchema),
    commandType: z.string().min(1, { message: "Command type is required" }),
    command: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if ((val.commandType === "npx" || val.commandType === "uvx") && !val.command) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Command is required when command type is `npx` or `uvx`",
        path: ["command"],
      })
    }
  })
export type GithubRegistSchemaType = z.infer<typeof GithubRegistSchema>

export const GithubRegistRequestSchema = z.object({
  transportType: TransportTypeSchema,
  repoKey: z.string().min(1, { message: "Repository key is required" }),
  owner: z.string().min(1, { message: "Owner is required" }),
  repo: z.string().min(1, { message: "Repository is required" }),
  baseDirectory: z.string().min(1, { message: "Base directory is required" }),
  envs: z.array(DeploymentEnvironmentSchema),
  commandType: z.string().min(1, { message: "Command type is required" }),
  command: z.string().optional(),
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
