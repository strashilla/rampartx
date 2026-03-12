import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CatalogContent } from "@/components/catalog-content"

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<div className="container mx-auto px-4 py-12 pt-28 min-h-[40vh] flex items-center justify-center text-[#6B7280] font-sans">Загрузка каталога...</div>}>
        <CatalogContent />
      </Suspense>
      <Footer />
    </main>
  )
}
