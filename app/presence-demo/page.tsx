import { PresenceDemo } from "../../components/ui/presence/presence-demo"

export const metadata = {
  title: "Presence System Demo",
  description: "Demo of the real-time presence system",
}

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

export default function PresenceDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <PresenceDemo />
    </div>
  )
}