import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AdvantagesSection } from "@/components/advantages-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { StatsSection } from "@/components/stats-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <AdvantagesSection />
      <HowItWorksSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
