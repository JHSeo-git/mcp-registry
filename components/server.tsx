"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ServerIcon } from "lucide-react"

import { getPublicRepoUrl } from "@/lib/git/utils"
import { RepositoryResponseSchema, RepositoryResponseSchemaType } from "@/lib/schema/repo"
import { cn } from "@/lib/utils"

import { Icons } from "./icons"
import { Badge } from "./ui/badge"
import { buttonVariants } from "./ui/button"

interface ServerProps {
  repoKey: string
}

function Server({ repoKey }: ServerProps) {
  const [item, setItem] = useState<RepositoryResponseSchemaType>()

  const fetchRepository = useCallback(async () => {
    const response = await fetch(`/api/mcp/repositories/${repoKey}`)

    const result = await response.json()

    if (result.status !== "success") {
      throw new Error(result.error)
    }

    const parsed = RepositoryResponseSchema.safeParse(result.data)

    if (!parsed.success) {
      throw new Error(`Invalid response: ${parsed.error.message}`)
    }

    setItem(parsed.data)
  }, [repoKey])

  useEffect(() => {
    fetchRepository()
  }, [fetchRepository])

  if (!item) {
    return null
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">{item.server?.name ?? item.name}</h2>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-muted-foreground">{item.repoKey}</span>
        <Link
          href={getPublicRepoUrl({ registry: item.registry, owner: item.project, repo: item.name })}
          className="hover:text-link transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icons.gitHub className="size-4" />
        </Link>
      </div>

      <div className="mt-2 flex justify-end border-t">
        <Link
          href={`/deployments/${item.repoKey}`}
          className={cn(buttonVariants({ variant: "ghost" }), "rounded-t-none")}
        >
          <ServerIcon className="size-4" />
          Deployments
        </Link>
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-bold">Overview</h3>
        <div className="mt-2">
          <p className="text-muted-foreground">
            *This would be a description of the server. It would be a good idea to add some markdown
            to make it look nice.*
          </p>
        </div>
      </div>
      <div className="mt-10">
        <h3 className="text-lg font-bold">Tools</h3>
        <div className="mt-2 flex flex-col gap-2">
          {item.tools.length === 0 && (
            <div className="text-muted-foreground">No tools found for this repository</div>
          )}
          {item.tools.map((tool) => (
            <div key={tool.id}>{tool.name}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { Server }
