import { ChatSystem } from "../../components/ui/chat/chat-system"

export const metadata = {
  title: "Chat System Demo",
  description: "Demo of the real-time chat system",
}

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

export default function ChatDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Real-Time Chat System</h1>
      <div className="border rounded-lg h-[600px] overflow-hidden">
        <ChatSystem />
      </div>
    </div>
  )
}