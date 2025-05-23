import { Deployments } from "@/components/deployments"
import { GoBack } from "@/components/go-back"

export default async function DeploymentPage({
  params,
}: {
  params: Promise<{ repokey: string[] }>
}) {
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
      <h1 className="text-center text-2xl font-bold">Deployments</h1>
      <div className="mt-6 flex justify-center">
        <Deployments repoKey={repoKey} />
      </div>
    </div>
  )
}
