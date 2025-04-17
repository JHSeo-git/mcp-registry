import { GoBack } from "@/components/go-back"
import { Server } from "@/components/server"

export default async function ServersPage({ params }: { params: Promise<{ repokey: string[] }> }) {
  const repoKeyArr = (await params).repokey

  if (!Array.isArray(repoKeyArr)) {
    return <div>Invalid repokey</div>
  }

  const repoKey = repoKeyArr.join("/")

  return (
    <div className="container mx-auto px-6">
      <div className="mb-6 flex items-center justify-center">
        <GoBack />
      </div>
      <Server repoKey={repoKey} />
    </div>
  )
}
