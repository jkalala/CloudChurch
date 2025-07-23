import { CollaborationDemo } from "../../components/ui/collaboration/collaboration-demo"

export const metadata = {
  title: "Collaborative Editing Demo",
  description: "Demo of the real-time collaborative editing system",
}

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

export default function CollaborationDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <CollaborationDemo />
    </div>
  )
}