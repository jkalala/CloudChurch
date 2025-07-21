import { CollaborationDemo } from "../../components/ui/collaboration/collaboration-demo"

export const metadata = {
  title: "Collaborative Editing Demo",
  description: "Demo of the real-time collaborative editing system",
}

export default function CollaborationDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <CollaborationDemo />
    </div>
  )
}