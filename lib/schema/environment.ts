import { z } from "zod"

export const EnvironmentSchema = z.object({
  key: z.string(),
  value: z.string(),
})

export type EnvironmentSchemaType = z.infer<typeof EnvironmentSchema>
