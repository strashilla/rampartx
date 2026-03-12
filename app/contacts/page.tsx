import { StaticPage } from "@/components/static-page"

export default function ContactsPage() {
  return (
    <StaticPage
      title="Контакты"
      description="Как с нами связаться."
    >
      <p className="mb-4">
        Email: support@rampartx.ru (для общих вопросов и обращений).
      </p>
      <p className="mb-4">
        Социальные сети и мессенджеры указаны в подвале сайта. По срочным вопросам
        по сделкам используйте чат в личном кабинете.
      </p>
    </StaticPage>
  )
}
