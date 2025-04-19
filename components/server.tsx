"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js"
import { Loader2, Minus, Play, Plus, ServerIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
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
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
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
          {tool.description && (
            <p className="text-muted-foreground mb-6 line-clamp-3 text-sm">{tool.description}</p>
          )}
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
  properties?: Record<string, SchemaProperty>
  required?: string[]
}

type FormValues = Record<string, string | number | boolean | unknown[]>

const validateNestedSchema = (
  data: unknown,
  schema: SchemaProperty,
  path: string,
  errors: Record<string, string>
) => {
  if (errors[path]) {
    return
  }

  if (!data && schema.type !== "boolean") {
    errors[path] = "This field is required"
    return
  }

  switch (schema.type) {
    case "object":
      if (schema.properties) {
        const objData = data as Record<string, unknown>
        if (schema.required) {
          for (const requiredKey of schema.required) {
            if (!objData[requiredKey]) {
              errors[`${path}.${requiredKey}`] = "This field is required"
            }
          }
        }
        Object.entries(schema.properties).forEach(([key, propSchema]) => {
          const newPath = path ? `${path}.${key}` : key
          if (objData[key]) {
            validateNestedSchema(objData[key], propSchema as SchemaProperty, newPath, errors)
          }
        })
      }
      break
    case "array":
      if (schema.items && Array.isArray(data)) {
        ;(data as unknown[]).forEach((item, index) => {
          validateNestedSchema(item, schema.items!, `${path}[${index}]`, errors)
        })
      }
      break
    case "boolean":
      // boolean 타입은 false 값도 유효한 값으로 처리
      break
    default:
      if (!data && data !== 0 && data !== false) {
        errors[path] = "This field is required"
      }
  }
}
function ToolItemContent({ repoKey, toolName, inputSchema }: ToolItemContentProps) {
  const form = useForm<FormValues>({
    defaultValues: {},
  })

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

  const onSubmit = async (data: FormValues) => {
    const errors: Record<string, string> = {}

    if (Array.isArray(inputSchemaObject.required)) {
      for (const requiredKey of inputSchemaObject.required) {
        if (!data[requiredKey]) {
          errors[requiredKey] = "This field is required"
        }

        const isArray = Array.isArray(data[requiredKey])
        if (isArray) {
          if ((data[requiredKey] as unknown[]).length === 0) {
            errors[requiredKey] = "This field is required"
          }
        }
      }
    }

    if (inputSchemaObject.properties) {
      Object.entries(inputSchemaObject.properties).forEach(([key, schema]) => {
        if (data[key]) {
          validateNestedSchema(data[key], schema as SchemaProperty, key, errors)
        }
      })
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
      arguments: data,
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

  const renderInputField = (
    key: string,
    schema: SchemaProperty,
    parentKey?: string,
    parentRequired?: string[]
  ) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key
    const type = schema.type
    const required = isRequired(key) || parentRequired?.includes(key)

    switch (type) {
      case "string":
        return (
          <FormItem key={fullKey} className="mb-4">
            <FormLabel htmlFor={fullKey}>
              {key}
              {required && <RequiredDot />}
            </FormLabel>
            <FormControl>
              <Controller
                name={fullKey}
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id={fullKey}
                    className="bg-background resize-none text-sm"
                    placeholder={schema.description}
                    value={(field.value as string) ?? ""}
                  />
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      case "number":
      case "integer":
        return (
          <FormItem key={fullKey} className="mb-4">
            <FormLabel htmlFor={fullKey}>
              {key}
              {required && <RequiredDot />}
            </FormLabel>
            <FormControl>
              <Controller
                name={fullKey}
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    id={fullKey}
                    className="bg-background text-sm"
                    placeholder={schema.description}
                    value={(field.value as number) ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                  />
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      case "boolean":
        return (
          <FormItem key={fullKey} className="mb-4">
            <FormLabel className="flex items-center" htmlFor={fullKey}>
              <Controller
                name={fullKey}
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    id={fullKey}
                    checked={(field.value as boolean) ?? false}
                    onCheckedChange={field.onChange}
                    className="bg-background"
                  />
                )}
              />
              {key}
              {required && <RequiredDot />}
            </FormLabel>
            {schema.description && (
              <p className="text-muted-foreground mt-1 ml-1 text-xs">{schema.description}</p>
            )}
            <FormMessage />
          </FormItem>
        )
      case "object":
        if (!schema.properties) return null
        return (
          <FormItem key={fullKey} className="mb-4">
            <FormLabel>
              {key}
              {required && <RequiredDot />}
            </FormLabel>
            <div className="rounded-md border p-4">
              {Object.entries(schema.properties).map(([propKey, propValue]) =>
                renderInputField(propKey, propValue as SchemaProperty, fullKey, schema.required)
              )}
            </div>
          </FormItem>
        )
      case "array":
        if (!schema.items) return null

        return (
          <FormItem key={fullKey} className="mb-4">
            <FormLabel>
              {key}
              {required && <RequiredDot />}
            </FormLabel>
            <div className="space-y-2">
              {schema.items.type === "object" && schema.items.properties && (
                <div className="space-y-4">
                  <Controller
                    name={fullKey}
                    control={form.control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <>
                        {(field.value as unknown[])?.map((_, index) => (
                          <div key={index} className="relative rounded-md border p-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="absolute top-1 right-1 size-6"
                              onClick={() => {
                                const newValue = [...(field.value as unknown[])]
                                newValue.splice(index, 1)
                                field.onChange(newValue)
                              }}
                            >
                              <Minus className="size-3" />
                            </Button>
                            {Object.entries(schema.items!.properties!).map(([itemKey, itemValue]) =>
                              renderInputField(
                                itemKey,
                                itemValue as SchemaProperty,
                                `${fullKey}[${index}]`,
                                schema.items!.required
                              )
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            field.onChange([...((field.value as unknown[]) || []), {}])
                          }}
                        >
                          <Plus className="size-4" />
                          Add {key}
                        </Button>
                      </>
                    )}
                  />
                </div>
              )}
              {schema.items.type && ["string", "number", "integer"].includes(schema.items.type) && (
                <div className="space-y-4">
                  <Controller
                    name={fullKey}
                    control={form.control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <>
                        {(field.value as unknown[])?.map((value, index) => (
                          <div key={index} className="relative">
                            <Input
                              type={schema.items!.type === "string" ? "text" : "number"}
                              className="bg-background pr-8 text-sm"
                              placeholder={schema.description}
                              value={value as string}
                              onChange={(e) => {
                                const newValue = [...(field.value as unknown[])]
                                newValue[index] =
                                  schema.items!.type === "number" ||
                                  schema.items!.type === "integer"
                                    ? Number(e.target.value)
                                    : e.target.value
                                field.onChange(newValue)
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="absolute top-1/2 right-1 size-6 -translate-y-1/2"
                              onClick={() => {
                                const newValue = [...(field.value as unknown[])]
                                newValue.splice(index, 1)
                                field.onChange(newValue)
                              }}
                            >
                              <Minus className="size-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            field.onChange([...((field.value as unknown[]) || []), ""])
                          }}
                        >
                          <Plus className="size-4" />
                          Add {key}
                        </Button>
                      </>
                    )}
                  />
                </div>
              )}
            </div>
          </FormItem>
        )
      default:
        return null
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
    </Form>
  )
}

function RequiredDot() {
  return <span className="inline-block size-1 rounded-full bg-red-500" />
}
