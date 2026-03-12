import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const faqs = [
  {
    question: "Что такое Rampartx?",
    answer:
      "Rampartx — это P2P маркетплейс цифровых товаров с эскроу-защитой сделок. Платформа выступает гарантом между покупателем и продавцом.",
  },
  {
    question: "Как происходит безопасная сделка?",
    answer:
      "Покупатель оплачивает товар, деньги блокируются на эскроу-счёте Rampartx. После получения товара покупатель подтверждает сделку, и средства перечисляются продавцу.",
  },
  {
    question: "Какая комиссия на платформе?",
    answer:
      "Стандартная комиссия платформы — 0.5% с каждой успешной сделки. Точная комиссия может зависеть от категории товара и акций.",
  },
  {
    question: "Какие товары можно продавать?",
    answer:
      "Разрешены только цифровые товары: аккаунты, ключи активации, внутриигровая валюта, подписки и другой цифровой контент, не нарушающий законодательство и правила площадки.",
  },
  {
    question: "Как пройти верификацию продавца?",
    answer:
      "После регистрации вы можете пройти верификацию в личном кабинете: подтвердить email, телефон и, при необходимости, загрузить документы. Верифицированные продавцы получают больше доверия и приоритет в выдаче.",
  },
  {
    question: "Что делать, если товар не соответствует описанию?",
    answer:
      "Откройте спор по сделке. Команда модерации изучит детали, запросит доказательства и примет решение: вернуть средства покупателю или перевести их продавцу.",
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Часто задаваемые вопросы
            </h1>
            <p className="font-sans text-muted-foreground">
              Ответы на популярные вопросы о том, как работает Rampartx, защита сделок и правила площадки.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card/60 px-5 py-4 md:px-6 md:py-5 text-left"
              >
                <h2 className="font-serif text-base md:text-lg font-semibold text-foreground mb-1.5">
                  {item.question}
                </h2>
                <p className="font-sans text-sm md:text-[15px] leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

