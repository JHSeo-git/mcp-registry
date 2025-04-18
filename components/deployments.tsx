"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowRight, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import {
  DeploymentSchemaType,
  DeploymentsResponseSchema,
  EnvironmentSchemaType,
} from "@/lib/schema/deployment"
import { cn } from "@/lib/utils"
import { useRegistGithub } from "@/app/hooks/use-regist-github"

import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

interface DeploymentsProps {
  repoKey: string
}

export function Deployments({ repoKey }: DeploymentsProps) {
  const [items, setItems] = useState<DeploymentSchemaType[]>([])
  const [envs, setEnvs] = useState<EnvironmentSchemaType[]>([])
  const [isLoadingRefresh, setIsLoadingRefresh] = useState(false)

  const { isLoading, fetchRegistGithub } = useRegistGithub()

  const fetchDeployments = useCallback(async () => {
    try {
      const response = await fetch(`/api/mcp/deployments/${repoKey}`)

      const result = await response.json()

      if (result.status !== "success") {
        throw new Error(result.error)
      }

      const parsed = DeploymentsResponseSchema.safeParse(result.data)

      if (!parsed.success) {
        throw new Error(`Invalid response: ${parsed.error.message}`)
      }

      setItems(parsed.data.deployments)
      setEnvs(parsed.data.envs)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch deployments")
    }
  }, [repoKey])

  const onClickRefetch = async () => {
    try {
      setIsLoadingRefresh(true)
      await fetchDeployments()
    } finally {
      setIsLoadingRefresh(false)
    }
  }

  const onClickDeploy = async () => {
    if (!confirm("배포 하시겠습니까?")) {
      return
    }

    const context = items?.[0]

    if (!context) {
      toast.error("Not found deployment context")
      return
    }

    await fetchRegistGithub({
      transportType: context.transportType,
      baseDirectory: context.baseDirectory,
      owner: context.project,
      repo: context.name,
      repoKey: context.repoKey,
      envs,
    })

    fetchDeployments()
  }

  useEffect(() => {
    fetchDeployments()
  }, [fetchDeployments])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center gap-2">
          <Button onClick={onClickRefetch} disabled={isLoadingRefresh} size="icon">
            <RefreshCw className={cn("h-4 w-4", isLoadingRefresh && "animate-spin")} />
          </Button>
          <Button onClick={onClickDeploy} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Deployment
          </Button>
        </div>
      </div>
      <Table className="mt-10">
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead className="w-[50%]">Commit</TableHead>
            <TableHead className="w-[10%] text-center">Transport</TableHead>
            <TableHead className="w-[10%] text-center">Branch</TableHead>
            <TableHead className="w-[10%] text-center">Status</TableHead>
            <TableHead className="w-[20%]">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="bg-muted h-[100px] text-center">
                No deployments found
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => (
            <DeploymentItem key={item.id} item={item} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function DeploymentItem({ item }: { item: DeploymentSchemaType }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <TableRow key={item.id}>
        <TableCell className="font-medium">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            <ArrowRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
          </Button>
        </TableCell>
        <TableCell className="text-sm font-medium tabular-nums">
          <div className="flex items-center">
            <span>{item.commit.slice(0, 7)}</span>
            <span className="ml-2 inline-block max-w-[300px] truncate text-xs text-gray-400">
              {item.commitMessage}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-center text-sm">{item.transportType}</TableCell>
        <TableCell className="text-center text-sm">{item.branch}</TableCell>
        <TableCell className="text-center text-sm">
          <Badge
            className={cn(
              "text-xs",
              item.status === "SUCCESS" && "bg-green-600",
              item.status === "FAILED" && "bg-red-600"
            )}
          >
            {item.status}
          </Badge>
        </TableCell>
        <TableCell className="text-xs tabular-nums">{item.updatedAt}</TableCell>
      </TableRow>
      {isOpen && (
        <TableRow>
          <TableCell colSpan={6} className="p-0">
            <pre className="bg-gray-900 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-300">
              {item.logs}
            </pre>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
