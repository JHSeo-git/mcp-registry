import { useCallback, useState } from "react"
import { toast } from "sonner"

import { GithubRegistRequestSchema, GithubRegistResponseSchema } from "@/lib/schema/regist"

export function useRegistGithub() {
  const [isLoading, setIsLoading] = useState(false)

  const fetchRegistGithub = useCallback(async (data: GithubRegistRequestSchema) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/mcp/regist/github", {
        method: "POST",
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.status !== "success") {
        throw new Error(result.error)
      }

      const parsed = GithubRegistResponseSchema.safeParse(result.data)

      if (!parsed.success) {
        throw new Error("Invalid response")
      }

      toast.success(`MCP Registry Started: ${parsed.data.repoKey}`)

      return parsed.data.deploymentId
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        toast.error(`Failed to register MCP: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    fetchRegistGithub,
  }
}
