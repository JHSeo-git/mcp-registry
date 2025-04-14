import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export default function Home() {
  return (
    <div className="container mx-auto py-6">
      <div>
        <Button variant="outline">
          <Icons.gitHub className="h-4 w-4" />
          Connect with Github
        </Button>
      </div>
      <div className="mt-4">
        <Button>Deployment</Button>
      </div>
    </div>
  )
}
