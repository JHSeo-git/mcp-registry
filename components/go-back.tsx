"use client"

import { useRouter } from "next/navigation"
import { Undo2 } from "lucide-react"

import { Button } from "./ui/button"

export function GoBack() {
  const router = useRouter()

  return (
    <Button variant="ghost" size="icon" onClick={() => router.back()}>
      <Undo2 className="size-6" />
    </Button>
  )
}
