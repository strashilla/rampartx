import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SettingsContent } from "@/components/settings-content"

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <SettingsContent />
      <Footer />
    </main>
  )
}
