"use client"

import { Shield, Percent, Zap, Lock, Clock, HeadphonesIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const advantages = [
  {
    icon: Shield,
    title: "Защита сделок",
    description: "Эскроу-система гарантирует безопасность каждой транзакции"
  },
  {
    icon: Percent,
    title: "Низкие комиссии",
    description: "Всего 0.5% — одна из самых низких на рынке"
  },
  {
    icon: Zap,
    title: "Быстрые сделки",
    description: "Мгновенное подтверждение и автоматическая обработка"
  },
  {
    icon: Lock,
    title: "Верификация",
    description: "Проверенные продавцы и система рейтингов"
  },
  {
    icon: Clock,
    title: "24/7 доступность",
    description: "Платформа работает круглосуточно без выходных"
  },
  {
    icon: HeadphonesIcon,
    title: "Поддержка",
    description: "Быстрое решение споров и помощь в любой ситуации"
  }
]

const DELAY_CLASSES = [
  "animate-text-reveal-delay-1",
  "animate-text-reveal-delay-2",
  "animate-text-reveal-delay-3",
  "animate-text-reveal-delay-4",
  "animate-text-reveal-delay-5",
  "animate-text-reveal-delay-6",
]
const CARD_DELAY_CLASSES = [
  "animate-card-reveal-delay-1",
  "animate-card-reveal-delay-2",
  "animate-card-reveal-delay-3",
  "animate-card-reveal-delay-4",
  "animate-card-reveal-delay-5",
  "animate-card-reveal-delay-6",
]

export function AdvantagesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="advantages" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="overflow-hidden">
            <h2
              className={`font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 ${
                visible ? "animate-text-reveal" : "advantages-clip-hidden"
              }`}
            >
              Почему выбирают нас
            </h2>
          </div>
          <div className="overflow-hidden">
            <p
              className={`font-sans text-muted-foreground max-w-lg mx-auto ${
                visible ? "animate-text-reveal animate-text-reveal-delay-1" : "advantages-clip-hidden"
              }`}
            >
              Все необходимое для безопасной торговли цифровыми товарами
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((item, index) => (
            <div
              key={index}
              className={`group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-200 ${
                visible ? `animate-card-reveal ${CARD_DELAY_CLASSES[index]}` : "opacity-0 translate-y-5"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="overflow-hidden">
                <h3
                  className={`font-serif text-lg font-bold text-foreground mb-2 ${
                    visible ? `animate-text-reveal ${DELAY_CLASSES[index]}` : "advantages-clip-hidden"
                  }`}
                >
                  {item.title}
                </h3>
              </div>
              <div className="overflow-hidden">
                <p
                  className={`font-sans text-sm text-muted-foreground leading-relaxed ${
                    visible ? `animate-text-reveal ${DELAY_CLASSES[index]}` : "advantages-clip-hidden"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
