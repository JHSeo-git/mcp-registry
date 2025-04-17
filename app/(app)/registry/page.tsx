import { Register } from "@/components/register"

export default function RegistryPage() {
  return (
    <div className="container mx-auto px-6">
      <h1 className="text-center text-2xl font-bold">Registry</h1>
      <div className="mt-6 flex justify-center">
        <Register />
      </div>
    </div>
  )
}
