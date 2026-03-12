import { StaticPage } from "@/components/static-page"

export default function AboutPage() {
  return (
    <StaticPage
      title="О проекте"
      description="Узнайте больше о Rampartx и нашей миссии."
    >
      <p className="mb-4">
        Rampartx — это P2P маркетплейс цифровых товаров с эскроу-защитой сделок.
        Платформа выступает гарантом между покупателем и продавцом: средства
        блокируются до подтверждения получения товара.
      </p>
      <p className="mb-4">
        Мы создаём безопасную среду для торговли аккаунтами, ключами, внутриигровыми
        предметами и другим цифровым контентом без рисков для обеих сторон.
      </p>
    </StaticPage>
  )
}
