import { StaticPage } from "@/components/static-page"

export default function CookiesPage() {
  return (
    <StaticPage
      title="Cookie"
      description="Использование файлов cookie на Rampartx."
    >
      <p className="mb-4">
        Мы используем cookie для работы авторизации, корзины и настроек сессии.
        Эти данные необходимы для функционирования сайта и не передаются третьим
        лицам в рекламных целях.
      </p>
      <p className="mb-4">
        Отключение cookie может ограничить возможность входа в аккаунт и оформления
        покупок.
      </p>
    </StaticPage>
  )
}
