"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className={`max-w-3xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-card border border-border ${visible ? "animate-card-reveal" : "opacity-0 translate-y-5"}`}>
          <div className="overflow-hidden mb-4">
            <h2 className={`font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground text-balance ${visible ? "animate-text-reveal" : "advantages-clip-hidden"}`}>
              Готовы начать торговать?
            </h2>
          </div>
          <div className="overflow-hidden mb-8">
            <p className={`font-sans text-muted-foreground max-w-md mx-auto ${visible ? "animate-text-reveal animate-text-reveal-delay-1" : "advantages-clip-hidden"}`}>
              Присоединяйтесь к тысячам пользователей и начните зарабатывать уже сегодня
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold px-8 h-12 text-base gap-2"
            >
              Создать аккаунт
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-border text-foreground hover:bg-secondary font-sans font-medium px-8 h-12 text-base bg-transparent"
            >
              Связаться с нами
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
