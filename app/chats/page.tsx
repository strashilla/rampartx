import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChatsContent } from "@/components/chats-content"

export default function ChatsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ChatsContent />
      <Footer />
    </main>
  )
}
