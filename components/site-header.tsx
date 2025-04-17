"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { buttonVariants } from "./ui/button"

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="my-10 flex items-center justify-center">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className={buttonVariants({
            variant: "ghost",
            className: pathname === "/" ? "text-primary" : "text-primary/50",
          })}
        >
          /
        </Link>
        <Link
          href="/registry"
          className={buttonVariants({
            variant: "ghost",
            className: pathname === "/registry" ? "text-primary" : "text-primary/50",
          })}
        >
          Registry
        </Link>
        <Link
          href="/servers"
          className={buttonVariants({
            variant: "ghost",
            className: pathname.startsWith("/servers") ? "text-primary" : "text-primary/50",
          })}
        >
          Servers
        </Link>
      </div>
    </header>
  )
}
