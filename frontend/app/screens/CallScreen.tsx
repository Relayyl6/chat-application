import ChatPreview from "@/components/ChatPreview"
import MainChat from "@/components/MainChat"

export default function ChatScreen() {

  return (
    <main className="flex flex-row bg-gray-700 w-full">
      <ChatPreview />
      <MainChat />
    </main>
  )
}