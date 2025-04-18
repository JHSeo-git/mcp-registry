import { z } from "zod"

export const ToolCallContentSchema = z.array(
  z.object({
    type: z.literal("text"), // text, image, audio, video
    text: z.string(),
  })
)
