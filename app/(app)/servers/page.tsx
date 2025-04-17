import { Servers } from "@/components/servers"

export default function ServersPage() {
  return (
    <div className="container mx-auto px-6">
      <h1 className="text-center text-2xl font-bold">Servers</h1>
      <div className="mt-6 flex justify-center">
        <Servers />
      </div>
    </div>
  )
}
