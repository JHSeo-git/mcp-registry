import { GoBack } from "@/components/go-back"
import { Register } from "@/components/register"

export default function RegistryPage() {
  return (
    <div className="container mx-auto px-6">
      <div className="mb-6 flex items-center justify-center">
        <GoBack />
      </div>
      <h1 className="text-center text-2xl font-bold">Registry</h1>
      <div className="mt-6">
        <Register />
      </div>
    </div>
  )
}
