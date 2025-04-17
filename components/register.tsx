"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { GithubRegistSchema, GithubRegistSchemaType } from "@/lib/schema/regist"
import { cn } from "@/lib/utils"
import { useRegistGithub } from "@/app/hooks/use-regist-github"

import { Icons } from "./icons"
import { Logs } from "./logs"
import { Button } from "./ui/button"
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"

export function Register() {
  const [deploymentId, setDeploymentId] = useState<string>()
  const [repoKeyPrefix, setRepoKeyPrefix] = useState<string>()

  const { isLoading, fetchRegistGithub } = useRegistGithub()

  const form = useForm({
    resolver: zodResolver(GithubRegistSchema),
    defaultValues: {
      repoKeyPostfix: "",
      owner: "",
      repo: "",
      baseDirectory: ".",
    },
  })

  const onSubmit = async (data: GithubRegistSchemaType) => {
    if (deploymentId) {
      const isConfirmed = confirm("현재 배포 진행 내역이 있습니다. 새로운 배포를 시작하시겠습니까?")

      if (!isConfirmed) {
        return
      }
      setDeploymentId(undefined)
    }

    const registeredDeploymentId = await fetchRegistGithub({
      ...data,
      repoKey: `${repoKeyPrefix}/${data.repoKeyPostfix}`,
    })

    setDeploymentId(registeredDeploymentId)
  }

  return (
    <div className="w-full max-w-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
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
          <Controller
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
          <Controller
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
          <Controller
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
