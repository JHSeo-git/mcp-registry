import { GoBack } from "@/components/go-back"
import { Servers } from "@/components/servers"

export default function ServersPage() {
  return (
    <div className="container mx-auto px-6">
      <div className="mb-6 flex items-center justify-center">
        <GoBack />
      </div>
      <h1 className="text-center text-2xl font-bold">Servers</h1>
      <div className="mt-6 flex justify-center">
        <Servers />
      </div>
    </div>
  )
}
