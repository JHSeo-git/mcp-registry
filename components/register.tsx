"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"

import { GithubRegistSchema, GithubRegistSchemaType } from "@/lib/schema/regist"
import { cn } from "@/lib/utils"
import { useRegistGithub } from "@/app/hooks/use-regist-github"

import { Icons } from "./icons"
import { Logs } from "./logs"
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export function Register() {
  const [deploymentId, setDeploymentId] = useState<string>()
  const [repoKeyPrefix, setRepoKeyPrefix] = useState<string>()

  const { isLoading, fetchRegistGithub } = useRegistGithub()

  const form = useForm<GithubRegistSchemaType>({
    resolver: zodResolver(GithubRegistSchema),
    defaultValues: {
      transportType: "stdio",
      repoKeyPostfix: "",
      owner: "",
      repo: "",
      baseDirectory: ".",
      envs: [],
      commandType: "docker",
      command: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "envs",
  })

  const commandType = form.watch("commandType")

  const onSubmit = async (data: GithubRegistSchemaType) => {
    if (deploymentId) {
      const isConfirmed = confirm("현재 배포 진행 내역이 있습니다. 새로운 배포를 시작하시겠습니까?")

      if (!isConfirmed) {
        return
      }
      setDeploymentId(undefined)
    }

    const { commandType, command, ...restData } = data

    const registeredDeploymentId = await fetchRegistGithub({
      ...restData,
      commandType,
      command: commandType === "docker" ? undefined : command,
      repoKey: `${repoKeyPrefix}/${data.repoKeyPostfix}`,
      envs: data.envs.filter((env) => env.key !== ""),
    })

    setDeploymentId(registeredDeploymentId)
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="owner"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Owner</FormLabel>
                <FormControl>
                  <Input
                    placeholder="owner"
                    onChange={(e) => {
                      setRepoKeyPrefix(e.target.value)
                      onChange(e)
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repo"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Repository name</FormLabel>
                <FormControl>
                  <Input placeholder="repository" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repoKeyPostfix"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Project key</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="border-border flex h-full items-center rounded-l-md bg-gray-200 px-2 text-sm text-nowrap">
                      {repoKeyPrefix} /
                    </div>
                    <Input placeholder="Repository key" className="rounded-l-none" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="baseDirectory"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Base directory</FormLabel>
                <FormControl>
                  <Input placeholder="base directory" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="commandType"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Command Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="명령어 타입을 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="docker">docker</SelectItem>
                    <SelectItem value="npx">npx</SelectItem>
                    <SelectItem value="uvx">uvx</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {commandType !== "docker" && (
            <FormField
              control={form.control}
              name="command"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Command</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={(() => {
                        if (commandType === "npx") {
                          return "npx -y your-mcp-server@1.0"
                        }
                        if (commandType === "uvx") {
                          return "uvx your-mcp-server"
                        }
                        return ""
                      })()}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="transportType"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Transport Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a transport type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="stdio">stdio</SelectItem>
                    <SelectItem value="sse" disabled>
                      sse
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-4 flex items-center justify-between">
            <FormLabel className="">Environment variables</FormLabel>
            <Button type="button" variant="outline" size="icon" onClick={() => append({ key: "" })}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`envs.${index}`}
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem className="mt-2">
                  <FormControl>
                    <div className="flex items-center gap-1">
                      <Input
                        placeholder="key"
                        value={value.key}
                        onChange={(e) => {
                          onChange({ ...value, key: e.target.value })
                        }}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <div className="mt-6">
            <Button type="submit" variant="outline" disabled={isLoading} className="w-full">
              {isLoading && <Icons.spinner className={cn("h-4 w-4 animate-spin")} />}
              Regist
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-10">{deploymentId && <Logs deploymentId={deploymentId} />}</div>
    </div>
  )
}
