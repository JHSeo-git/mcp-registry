"use client"

import { useCallback, useEffect, useState } from "react"

import { DeploymentStatus } from "@/lib/db/schema"
import { DeploymentLogsResponseSchema } from "@/lib/schema/deployment"

interface LogsProps {
  deploymentId: string
}

const POLLING_TIME = 3000
export function Logs({ deploymentId }: LogsProps) {
  const [logs, setLogs] = useState<string>()
  const [status, setStatus] = useState<DeploymentStatus>("PENDING")

  const fetchLogs = useCallback(async () => {
    const response = await fetch(`/api/mcp/deployments/${deploymentId}/logs`)
    const result = await response.json()

    if (result.status !== "success") {
      throw new Error(result.error)
    }

    const parsed = DeploymentLogsResponseSchema.safeParse(result.data)

    if (!parsed.success) {
      throw new Error(`Invalid response: ${parsed.error.message}`)
    }

    setLogs(parsed.data.logs)
    setStatus(parsed.data.status)
  }, [deploymentId])

  useEffect(() => {
    fetchLogs()

    const interval = setInterval(() => {
      if (status === "FAILED" || status === "SUCCESS") {
        clearInterval(interval)
        return
      }
      fetchLogs()
    }, POLLING_TIME)

    return () => {
      clearInterval(interval)
    }
  }, [fetchLogs, status])

  if (!logs) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-md">
      <pre className="bg-gray-900 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-300">
        {logs}
      </pre>
    </div>
  )
}
