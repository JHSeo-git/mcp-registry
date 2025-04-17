import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-6">
      <h1 className="text-center text-2xl">
        <span className="font-bold">M</span>odel
        <span className="font-bold">C</span>ontext
        <span className="font-bold">P</span>rotocol
      </h1>
      <p className="text-muted-foreground text-center text-sm">
        Get started with the Model Context Protocol (MCP)
      </p>
      <div className="mt-6 flex justify-center">
        <ul className="list-disc pl-2">
          <li>
            <Link
              href="https://modelcontextprotocol.io/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              https://modelcontextprotocol.io
            </Link>
          </li>
          <li>
            <Link
              href="https://smithery.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              https://smithery.ai
            </Link>
          </li>
          <li>
            <Link
              href="https://mcp.so"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              https://mcp.so
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
