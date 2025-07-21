import { PresenceDemo } from "../../components/ui/presence/presence-demo"

export const metadata = {
  title: "Presence System Demo",
  description: "Demo of the real-time presence system",
}

export default function PresenceDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <PresenceDemo />
    </div>
  )
}