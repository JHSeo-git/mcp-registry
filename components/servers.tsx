"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { getPublicRepoUrl } from "@/lib/git/utils"
import { RepositoriesResponseSchema, RepositorySchemaType } from "@/lib/schema/repo"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

export function Servers() {
  const [items, setItems] = useState<RepositorySchemaType[]>([])

  const fetchDeployments = useCallback(async () => {
    const response = await fetch(`/api/mcp/repositories`)

    const result = await response.json()

    if (result.status !== "success") {
      throw new Error(result.error)
    }

    const parsed = RepositoriesResponseSchema.safeParse(result.data)

    if (!parsed.success) {
      throw new Error(`Invalid response: ${parsed.error.message}`)
    }

    setItems(parsed.data.repositories)
  }, [])

  useEffect(() => {
    fetchDeployments()
  }, [fetchDeployments])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8"></TableHead>
          <TableHead className="w-[30%]">Key</TableHead>
          <TableHead className="w-[15%] text-center">Project</TableHead>
          <TableHead className="w-[10%] text-center">Name</TableHead>
          <TableHead className="w-[10%] text-center">Registry</TableHead>
          <TableHead className="w-[15%] text-center">Base Directory</TableHead>
          <TableHead className="w-[10%] text-center">Deploy</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="bg-muted h-[100px] text-center">
              No repositories found
            </TableCell>
          </TableRow>
        )}
        {items.map((item) => (
          <RepositoryItem key={item.id} item={item} />
        ))}
      </TableBody>
    </Table>
  )
}

function RepositoryItem({ item }: { item: RepositorySchemaType }) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link
          href={getPublicRepoUrl({ registry: item.registry, owner: item.project, repo: item.name })}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </TableCell>
      <TableCell className="text-sm font-medium">{item.repoKey}</TableCell>
      <TableCell className="text-center text-sm">{item.project}</TableCell>
      <TableCell className="text-center text-sm">{item.name}</TableCell>
      <TableCell className="text-center text-sm">{item.registry}</TableCell>
      <TableCell className="text-center text-sm">{item.baseDirectory}</TableCell>
      <TableCell className="text-center text-sm">
        <Link href={`/deployments/${item.repoKey}`} className="text-link hover:underline">
          DEPLOY
        </Link>
      </TableCell>
    </TableRow>
  )
}
