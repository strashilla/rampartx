import { StaticPage } from "@/components/static-page"

export default function SupportPage() {
  return (
    <StaticPage
      title="Поддержка"
      description="Свяжитесь с нами по любым вопросам."
    >
      <p className="mb-4">
        По вопросам работы платформы, споров и технической поддержки обращайтесь
        через раздел «Контакты» или в чате сделки. Ответим в кратчайшие сроки.
      </p>
    </StaticPage>
  )
}
