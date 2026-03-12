'use client'

import CountUp from "./CountUp"
import { useEffect, useRef, useState } from "react"

const stats = [
  {
    value: 50000,
    label: "Успешных сделок",
    description: "Завершено на платформе",
    suffix: "+",
    separator: " ",
  },
  {
    value: 15000,
    label: "Пользователей",
    description: "Доверяют нам ежедневно",
    suffix: "+",
    separator: " ",
  },
  {
    value: 4.9,
    label: "Рейтинг",
    description: "Средняя оценка платформы",
    suffix: "",
    separator: "",
  },
  {
    value: 5,
    label: "Время сделки",
    description: "Среднее время операции",
    prefix: "< ",
    suffix: " мин",
    separator: "",
  },
]

const CARD_DELAYS = ["animate-card-reveal-delay-1", "animate-card-reveal-delay-2", "animate-card-reveal-delay-3", "animate-card-reveal-delay-4"]
const TEXT_DELAYS = ["animate-text-reveal-delay-1", "animate-text-reveal-delay-2", "animate-text-reveal-delay-3", "animate-text-reveal-delay-4"]

export function StatsSection() {
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
    <section ref={sectionRef} id="stats" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="overflow-hidden">
            <h2 className={`font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 ${visible ? "animate-text-reveal" : "advantages-clip-hidden"}`}>
              Цифры говорят сами
            </h2>
          </div>
          <div className="overflow-hidden">
            <p className={`font-sans text-muted-foreground max-w-lg mx-auto ${visible ? "animate-text-reveal animate-text-reveal-delay-1" : "advantages-clip-hidden"}`}>
              Статистика нашей платформы в реальном времени
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl bg-card border border-border text-center ${visible ? `animate-card-reveal ${CARD_DELAYS[index]}` : "opacity-0 translate-y-5"}`}
            >
              <div className="font-mono text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.prefix}
                <CountUp
                  from={0}
                  to={stat.value}
                  separator={stat.separator}
                  direction="up"
                  duration={1.2}
                  className=""
                  startWhen={visible}
                />
                {stat.suffix}
              </div>
              <div className="overflow-hidden">
                <div className={`font-serif font-bold text-foreground mb-1 ${visible ? `animate-text-reveal ${TEXT_DELAYS[index]}` : "advantages-clip-hidden"}`}>
                  {stat.label}
                </div>
              </div>
              <div className="overflow-hidden">
                <p className={`font-sans text-xs text-muted-foreground ${visible ? `animate-text-reveal ${TEXT_DELAYS[index]}` : "advantages-clip-hidden"}`}>
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
