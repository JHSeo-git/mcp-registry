import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import "./globals.css"

import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const fontSans = GeistSans
const fontMono = GeistMono

export const metadata: Metadata = {
  title: "MCP Registry",
  description: "A Registry for a MCP Servers",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={cn("min-h-svh font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <div className="bg-background relative flex min-h-svh flex-col">{children}</div>
        <Toaster />
      </body>
    </html>
  )
}
