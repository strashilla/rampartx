import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OrdersContent } from "@/components/orders-content"

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <OrdersContent />
      <Footer />
    </main>
  )
}
