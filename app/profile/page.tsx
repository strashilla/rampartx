import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProfileContent } from "@/components/profile-content"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ProfileContent />
      <Footer />
    </main>
  )
}

