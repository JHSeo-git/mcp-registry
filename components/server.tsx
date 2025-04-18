"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js"
import { Loader2, Play, ServerIcon } from "lucide-react"
import { toast } from "sonner"

import { getPublicRepoUrl } from "@/lib/git/utils"
import {
  RepositoryResponseSchema,
  RepositoryResponseSchemaType,
  ToolSchemaType,
} from "@/lib/schema/repo"
import { cn } from "@/lib/utils"
import { useToolCall } from "@/app/hooks/use-tool-call"

import { Icons } from "./icons"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { Button, buttonVariants } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"

interface ServerProps {
  repoKey: string
}

export function Server({ repoKey }: ServerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [item, setItem] = useState<RepositoryResponseSchemaType>()

  const fetchRepository = useCallback(async () => {
    try {
      setIsLoading(true)

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
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch repository")
    } finally {
      setIsLoading(false)
    }
  }, [repoKey])

  useEffect(() => {
    fetchRepository()
  }, [fetchRepository])

  if (isLoading) {
    return <p className="mx-auto w-full max-w-xl text-center">Loading...</p>
  }

  if (!item) {
    return <p className="mx-auto w-full max-w-xl text-center">No item found</p>
  }

  return (
    <div className="mx-auto w-full max-w-xl">
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Tools</h3>
          {/* <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs select-none">Server</span>
              <ConnectionDot isConnected={isConnected} />
            </div>
            <Button type="button" variant="outline" disabled={isConnected}>
              Connect
            </Button>
          </div> */}
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {item.tools.length === 0 && (
            <div className="text-muted-foreground">No tools found for this repository</div>
          )}
          {item.tools.map((tool) => (
            <ToolItem key={tool.id} repoKey={repoKey} tool={tool} />
          ))}
        </div>
      </div>

      <div className="mt-10"></div>
    </div>
  )
}

function ConnectionDot({ isConnected }: { isConnected: boolean }) {
  return <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
}

function ToolItem({ repoKey, tool }: { repoKey: string; tool: ToolSchemaType }) {
  return (
    <Accordion type="single" collapsible className="bg-muted w-full rounded-md border-b px-4">
      <AccordionItem value={tool.id}>
        <AccordionTrigger>{tool.name}</AccordionTrigger>
        <AccordionContent>
          <ToolItemContent repoKey={repoKey} toolName={tool.name} inputSchema={tool.inputSchema} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const InputSchema = ListToolsResultSchema.shape.tools.element.shape.inputSchema
interface ToolItemContentProps {
  repoKey: string
  toolName: string
  inputSchema: unknown
}

type SchemaProperty = {
  type: string
  description?: string
  items?: SchemaProperty
}

function ToolItemContent({ repoKey, toolName, inputSchema }: ToolItemContentProps) {
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [resultTexts, setResultTexts] = useState<string[]>([])
  const { toolCall, isLoading } = useToolCall()

  const parsedInputSchema = InputSchema.safeParse(inputSchema)
  if (!parsedInputSchema.success) {
    return null
  }

  const inputSchemaObject = parsedInputSchema.data

  if (inputSchemaObject.type !== "object" || !inputSchemaObject.properties) {
    return null
  }

  const isRequired = (key: string) => {
    return Array.isArray(inputSchemaObject.required) && inputSchemaObject.required.includes(key)
  }

  const onChange = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const errors: Record<string, string> = {}

    if (Array.isArray(inputSchemaObject.required)) {
      for (const requiredKey of inputSchemaObject.required) {
        if (!values[requiredKey]) {
          errors[requiredKey] = "This field is required"
        }
      }
    }

    for (const [key, value] of Object.entries(values)) {
      if (isRequired(key) && !value) {
        errors[key] = "This field is required"
      }
    }

    if (Object.keys(errors).length > 0) {
      toast.error(
        `Please fill in all required fields: ${Object.keys(errors)
          .map((e) => `[${e}]`)
          .join(" ")}`
      )
      return
    }

    const result = await toolCall(repoKey, {
      toolName,
      arguments: values,
    })

    if (!result) {
      return
    }

    setResultTexts(
      result
        .filter((r) => r.type === "text")
        .map((r) => {
          try {
            return JSON.stringify(JSON.parse(r.text), null, 2)
          } catch {
            return r.text
          }
        })
    )
  }

  const renderInputField = (key: string, schema: SchemaProperty) => {
    const type = schema.type
    const required = isRequired(key)

    switch (type) {
      case "string":
        return (
          <div key={key} className="mb-4">
            <Label className="mb-2 ml-1" htmlFor={key}>
              {key}
              {required && <RequiredDot />}
            </Label>
            <Textarea
              id={key}
              className="bg-background resize-none text-sm"
              placeholder={schema.description}
              value={(values[key] as string) ?? ""}
              onChange={(e) => onChange(key, e.target.value)}
            />
          </div>
        )
      case "number":
      case "integer":
        return (
          <div key={key} className="mb-4">
            <Label className="mb-2 ml-1" htmlFor={key}>
              {key}
              {required && <RequiredDot />}
            </Label>
            <Input
              id={key}
              type="number"
              className="bg-background text-sm"
              placeholder={schema.description}
              value={(values[key] as number) ?? ""}
              onChange={(e) => onChange(key, e.target.value ? Number(e.target.value) : "")}
            />
          </div>
        )
      case "boolean":
        return (
          <div key={key} className="mb-4">
            <Label className="flex items-center" htmlFor={key}>
              <Checkbox
                className="mr-2"
                id={key}
                checked={(values[key] as boolean) ?? false}
                onCheckedChange={(checked) => onChange(key, checked)}
              />
              {key}
              {required && <RequiredDot />}
            </Label>
          </div>
        )
      case "array":
        return (
          <div key={key} className="mb-4">
            <Label className="mb-2 ml-1">
              {key}
              {required && <RequiredDot />}
            </Label>
            <div className="space-y-2">
              {schema.items && renderInputField(`${key}_item`, schema.items)}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        {Object.entries(inputSchemaObject.properties).map(([key, value]) =>
          renderInputField(key, value as SchemaProperty)
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="outline" disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          Run
        </Button>
      </div>
      <div className="bg-muted mt-4 overflow-hidden rounded-md">
        {resultTexts.map((resultText, i) => (
          <pre
            key={`tool-call-${i}`}
            className="max-h-[500px] overflow-y-auto bg-gray-900 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-300"
          >
            {resultText}
          </pre>
        ))}
      </div>
    </form>
  )
}

function RequiredDot() {
  return <span className="inline-block size-1 rounded-full bg-red-500" />
}
