import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export function StaticPage({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              {title}
            </h1>
            {description && (
              <p className="font-sans text-muted-foreground mb-8">{description}</p>
            )}
            <div className="font-sans text-foreground prose prose-invert max-w-none">
              {children}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
