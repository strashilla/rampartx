import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DealContent } from "@/components/deal-content"

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <DealContent dealId={id} />
      <Footer />
    </main>
  )
}
