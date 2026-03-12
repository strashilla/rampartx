"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"
import Link from "next/link"
import Aurora from "@/app/Aurora"
import { useEffect, useRef, useState } from "react"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const reveal = () => setVisible(true)
    const checkInView = () => {
      const rect = el.getBoundingClientRect()
      return rect.top < window.innerHeight && rect.bottom > 0
    }
    // Прелоадер уже скрылся до монтирования героя (например при F5) — показываем сразу
    const w = typeof window !== "undefined" ? (window as unknown as { __preloaderHidden?: boolean }) : null
    if (w?.__preloaderHidden) {
      reveal()
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) reveal() },
      { threshold: 0, rootMargin: "0px" }
    )
    obs.observe(el)
    window.addEventListener("preloader-hidden", reveal)
    // Fallback: через 100ms и через 4s (после прелоадера) если герой в зоне видимости
    const t1 = setTimeout(() => { if (checkInView()) reveal() }, 100)
    const t2 = setTimeout(() => { if (checkInView()) reveal() }, 4000)
    return () => {
      obs.disconnect()
      window.removeEventListener("preloader-hidden", reveal)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0">
        <Aurora
          colorStops={["#7fffd4", "#40e0d0", "#afeeee"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>

      <div className="relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className={`mb-8 ${visible ? "animate-card-reveal" : "opacity-0 translate-y-5"}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-sans text-sm text-primary">Защищенные сделки</span>
              </div>
            </div>

            <div className="overflow-hidden mb-6">
              <h1 className={`font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance ${visible ? "animate-text-reveal" : "advantages-clip-hidden"}`}>
                P2P маркетплейс{" "}
                <span className="text-primary">цифровых товаров</span>
              </h1>
            </div>
            
            <div className="overflow-hidden mb-10">
              <p className={`font-sans text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed ${visible ? "animate-text-reveal animate-text-reveal-delay-1" : "advantages-clip-hidden"}`}>
                Безопасная торговля без посредников. Низкие комиссии, быстрые сделки и защита каждой транзакции.
              </p>
            </div>
            
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${visible ? "animate-card-reveal animate-card-reveal-delay-2" : "opacity-0 translate-y-5"}`}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-sans font-semibold px-8 h-12 text-base gap-2 hover:brightness-110 hover:shadow-[0_0_20px_rgba(127,255,212,0.4)]"
                asChild
              >
                <Link href="/register">
                  Начать торговать
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-foreground hover:bg-primary/10 hover:text-primary font-sans font-medium px-8 h-12 text-base bg-transparent"
                asChild
              >
                <Link href="/catalog">Смотреть каталог</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className={`flex flex-wrap justify-center items-center gap-8 mt-16 pt-8 border-t border-border ${visible ? "animate-card-reveal animate-card-reveal-delay-4" : "opacity-0 translate-y-5"}`}>
              <div className="overflow-hidden">
                <div className={`font-mono text-2xl font-bold text-foreground ${visible ? "animate-text-reveal animate-text-reveal-delay-3" : "advantages-clip-hidden"}`}>50K+</div>
                <div className="font-sans text-sm text-muted-foreground">сделок</div>
              </div>
              <div className="w-px h-8 bg-border hidden sm:block" />
              <div className="overflow-hidden">
                <div className={`font-mono text-2xl font-bold text-foreground ${visible ? "animate-text-reveal animate-text-reveal-delay-3" : "advantages-clip-hidden"}`}>15K+</div>
                <div className="font-sans text-sm text-muted-foreground">пользователей</div>
              </div>
              <div className="w-px h-8 bg-border hidden sm:block" />
              <div className="overflow-hidden">
                <div className={`font-mono text-2xl font-bold text-foreground ${visible ? "animate-text-reveal animate-text-reveal-delay-3" : "advantages-clip-hidden"}`}>0.5%</div>
                <div className="font-sans text-sm text-muted-foreground">комиссия</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
