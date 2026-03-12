"use client"

import { UserPlus, Search, ShieldCheck, CheckCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Регистрация",
    description: "Создайте аккаунт за минуту. Простая верификация и полный доступ к платформе."
  },
  {
    icon: Search,
    number: "02",
    title: "Выбор товара",
    description: "Найдите нужный товар в каталоге или создайте свое предложение для продажи."
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Безопасная сделка",
    description: "Оплата блокируется на эскроу до подтверждения получения товара."
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Получение",
    description: "Покупатель получает товар, продавец — оплату. Все защищено системой."
  }
]

const CARD_DELAYS = ["animate-card-reveal-delay-1", "animate-card-reveal-delay-2", "animate-card-reveal-delay-3", "animate-card-reveal-delay-4"]
const TEXT_DELAYS = ["animate-text-reveal-delay-1", "animate-text-reveal-delay-2", "animate-text-reveal-delay-3", "animate-text-reveal-delay-4"]

export function HowItWorksSection() {
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
    <section ref={sectionRef} id="how-it-works" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="overflow-hidden">
            <h2 className={`font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 ${visible ? "animate-text-reveal" : "advantages-clip-hidden"}`}>
              Как это работает
            </h2>
          </div>
          <div className="overflow-hidden">
            <p className={`font-sans text-muted-foreground max-w-lg mx-auto ${visible ? "animate-text-reveal animate-text-reveal-delay-1" : "advantages-clip-hidden"}`}>
              Четыре простых шага для безопасной сделки
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
          {steps.map((step, index) => (
            <div key={index} className={`relative h-full ${visible ? `animate-card-reveal ${CARD_DELAYS[index]}` : "opacity-0 translate-y-5"}`}>
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-border" />
              )}
              
              <div className="relative h-full p-6 rounded-2xl bg-card border border-border text-center flex flex-col">
                {/* Step number */}
                <div className="absolute -top-3 left-6 font-mono text-xs font-bold text-primary bg-background px-2">
                  {step.number}
                </div>
                
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                
                <div className="overflow-hidden">
                  <h3 className={`font-serif text-lg font-bold text-foreground mb-2 ${visible ? `animate-text-reveal ${TEXT_DELAYS[index]}` : "advantages-clip-hidden"}`}>
                    {step.title}
                  </h3>
                </div>
                <div className="overflow-hidden">
                  <p className={`font-sans text-sm text-muted-foreground leading-relaxed ${visible ? `animate-text-reveal ${TEXT_DELAYS[index]}` : "advantages-clip-hidden"}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
