import { useCallback, useState } from "react"
import { toast } from "sonner"

import { ToolCallRequestSchemaType, ToolCallResponseSchema } from "@/lib/schema/server"

export function useToolCall() {
  const [isLoading, setIsLoading] = useState(false)

  const toolCall = useCallback(async (repoKey: string, data: ToolCallRequestSchemaType) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/mcp/servers/tool/call/${repoKey}`, {
        method: "POST",
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.status !== "success") {
        throw new Error(result.error)
      }

      const parsed = ToolCallResponseSchema.safeParse(result.data)

      if (!parsed.success) {
        throw new Error("Invalid response")
      }

      return parsed.data.result
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        toast.error(`Failed to call tool: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    toolCall,
  }
}
