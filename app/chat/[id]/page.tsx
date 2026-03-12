import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChatRoomContent } from "@/components/chat-room-content"

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ChatRoomContent chatId={id} />
      <Footer />
    </main>
  )
}
