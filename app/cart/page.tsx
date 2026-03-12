import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartContent } from "@/components/cart-content"

export default function CartPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <CartContent />
      <Footer />
    </main>
  )
}
