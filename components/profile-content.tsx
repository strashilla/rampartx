"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Shield, Settings, Package, Loader2, Star, ShoppingBag, Heart, MessageSquare, Wallet, TrendingUp, History, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface DealPurchase {
  id: string
  title: string
  sellerName: string
  status: string
  total: number
  createdAt: string
  hasReview?: boolean
  reviewRating?: number
}

interface DealSale {
  id: string
  title: string
  buyerName: string
  status: string
  total: number
  createdAt: string
}

interface FavoriteLot {
  id: string
  title: string
  price: number
  currency: string
  image?: string
  seller: { name: string; rating: number; deals?: number }
  category: string
}

interface MyReview {
  id: string
  orderId: string
  lotTitle: string
  rating: number
  comment?: string
  createdAt: string
}

export function ProfileContent() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState<DealPurchase[]>([])
  const [sales, setSales] = useState<DealSale[]>([])
  const [stats, setStats] = useState({ dealsCount: 0, ratingReceived: null as number | null })
  const [reviewModal, setReviewModal] = useState<{ orderId: string; title: string } | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [favorites, setFavorites] = useState<FavoriteLot[]>([])
   const [myReviews, setMyReviews] = useState<MyReview[]>([])
  const [reviewsAboutMe, setReviewsAboutMe] = useState<{ id: string; orderId: string; lotTitle: string; rating: number; comment: string | null; createdAt: string; buyerName: string }[]>([])
  const [myLots, setMyLots] = useState<{ id: string; title: string; price: number; currency: string; status: string; image?: string; createdAt: string }[]>([])
  const [disputes, setDisputes] = useState<{ id: string; orderId: string; status: string; createdAt: string; lotTitle: string }[]>([])
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((authData) => {
        if (!authData?.user) {
          router.replace("/login")
          setLoading(false)
          return undefined
        }
        setUser(authData.user)
        setBalance(authData.balance ?? 0)
        return Promise.all([
          fetch("/api/profile/deals").then((r) => r.json()),
          fetch("/api/favorites").then((r) => r.json()).catch(() => []),
          fetch("/api/profile/my-reviews").then((r) => r.json()).catch(() => ({ reviews: [] })),
          fetch("/api/profile/my-lots").then((r) => r.json()).catch(() => ({ lots: [] })),
          fetch("/api/disputes").then((r) => r.json()).catch(() => ({ disputes: [] })),
        ])
      })
      .then((result) => {
        if (!result) return
        const [dealsData, favList, reviewsData, myLotsData, disputesData] = result
        setPurchases(dealsData?.purchases ?? [])
        setSales(dealsData?.sales ?? [])
        setStats(dealsData?.stats ?? { dealsCount: 0, ratingReceived: null })
        setReviewsAboutMe(dealsData?.reviewsAboutMe ?? [])
        setFavorites(Array.isArray(favList) ? favList : [])
        setMyReviews(reviewsData?.reviews ?? [])
        setMyLots(myLotsData?.lots ?? [])
        setDisputes(disputesData?.disputes ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  async function submitReview() {
    if (!reviewModal) return
    setReviewSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${reviewModal.orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось отправить отзыв")
        return
      }
      toast.success("Отзыв сохранён")
      setReviewModal(null)
      setReviewComment("")
      setReviewRating(5)
      const dealsRes = await fetch("/api/profile/deals")
      const dealsData = await dealsRes.json().catch(() => ({}))
      setPurchases(dealsData.purchases ?? purchases)
      setStats(dealsData.stats ?? stats)
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#7fffd4]" />
      </div>
    )
  }

  if (!user) return null

  const initials =
    user.name && user.name.trim().length > 0
      ? user.name
          .trim()
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "R"

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
              Профиль
            </h1>
            <p className="text-[#AFEEEE] font-sans text-sm md:text-base">
              Ваш основной аккаунт в Rampartx
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              asChild
              className="border-[#7fffd4] text-[#7fffd4] hover:bg-[#7fffd4]/10 font-sans h-10 px-4"
            >
              <Link href="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Настройки
              </Link>
            </Button>
            <Button
              asChild
              className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans h-10 px-4"
            >
              <Link href="/create-lot">Создать лот</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="flex flex-wrap w-full gap-1 bg-[#1a1a1a] border border-[#2a2a2a] p-1 mb-6">
            <TabsTrigger value="purchases" className="font-sans data-[state=active]:bg-[#7fffd4] data-[state=active]:text-black">
              Мои покупки
            </TabsTrigger>
            <TabsTrigger value="favorites" className="font-sans data-[state=active]:bg-[#7fffd4] data-[state=active]:text-black">
              Избранное
            </TabsTrigger>
            <TabsTrigger value="my-lots" className="font-sans data-[state=active]:bg-[#7fffd4] data-[state=active]:text-black">
              Мои лоты
            </TabsTrigger>
            <TabsTrigger value="active-sales" className="font-sans data-[state=active]:bg-[#7fffd4] data-[state=active]:text-black">
              Активные продажи
            </TabsTrigger>
            <TabsTrigger value="sales-history" className="font-sans data-[state=active]:bg-[#7fffd4] data-[state=active]:text-black">
              История продаж
            </TabsTrigger>
            <TabsTrigger value="finance" className="font-sans data-[state=active]:bg-[#7fffd4] data-[state=active]:text-black">
              Финансы
            </TabsTrigger>
            <TabsTrigger value="stats" className="font-sans data-[state=active]:bg-[#7fffd4] data-[state=active]:text-black">
              Статистика
            </TabsTrigger>
            <TabsTrigger value="reviews" className="font-sans data-[state=active]:bg-[#7fffd4] data-[state=active]:text-black">
              Мои отзывы
            </TabsTrigger>
            <TabsTrigger value="disputes" className="font-sans data-[state=active]:bg-[#7fffd4] data-[state=active]:text-black">
              Мои споры
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-sans data-[state=active]:bg-[#7fffd4] data-[state=active]:text-black">
              Настройки
            </TabsTrigger>
            <TabsTrigger value="balance" className="font-sans data-[state=active]:bg-[#7fffd4] data-[state=active]:text-black">
              Баланс
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchases" className="mt-0">
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          {/* Основной блок профиля */}
          <section className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#7fffd4] to-[#40E0D0] flex items-center justify-center">
                <span className="font-serif text-xl sm:text-2xl font-bold text-black">
                  {initials}
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-serif text-xl md:text-2xl font-bold text-white">
                  {user.name || "Пользователь"}
                </p>
                <div className="flex items-center gap-2 text-gray-400 font-sans text-sm">
                  <Mail className="w-4 h-4 text-[#AFEEEE]" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-sans text-gray-500 mt-1">
                  <Shield className="w-4 h-4 text-[#7fffd4]" />
                  <span>Защита сделок Rampartx включена по умолчанию</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#2a2a2a] bg-[#1111] px-4 py-3">
                <p className="font-sans text-xs text-gray-400 mb-1">Сделки</p>
                <p className="font-serif text-2xl text-white">{stats.dealsCount}</p>
                <p className="font-sans text-[11px] text-gray-500 mt-1">
                  {stats.dealsCount === 0 ? "Покупки и продажи" : "Покупки + продажи"}
                </p>
              </div>
              <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] px-4 py-3">
                <p className="font-sans text-xs text-gray-400 mb-1">Рейтинг</p>
                <p className="font-serif text-2xl text-white">
                  {stats.ratingReceived != null ? `${stats.ratingReceived} ★` : "—"}
                </p>
                <p className="font-sans text-[11px] text-gray-500 mt-1">
                  Оценки от покупателей
                </p>
              </div>
              <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] px-4 py-3">
                <p className="font-sans text-xs text-gray-400 mb-1">Статус</p>
                <p className="font-serif text-2xl text-[#7fffd4]">
                  {stats.dealsCount === 0
                    ? "Новичок"
                    : stats.ratingReceived != null && stats.ratingReceived >= 4.5 && stats.dealsCount >= 5
                    ? "Надёжный"
                    : "Базовый"}
                </p>
                <p className="font-sans text-[11px] text-gray-500 mt-1">
                  Чтобы повысить статус: завершайте сделки без споров, получайте оценки 4–5★ и в будущем пройдите верификацию.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] px-4 py-4 space-y-2">
              <p className="font-sans text-xs text-gray-400">
                Как прокачать аккаунт
              </p>
              <ul className="space-y-1.5 text-xs font-sans">
                <li className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      stats.dealsCount > 0 ? "bg-[#7fffd4]" : "bg-gray-600"
                    }`}
                  />
                  <span className={stats.dealsCount > 0 ? "text-gray-200" : "text-gray-400"}>
                    Совершите первую сделку как покупатель или продавец
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      stats.dealsCount >= 3 && (stats.ratingReceived ?? 0) >= 4 ? "bg-[#7fffd4]" : "bg-gray-600"
                    }`}
                  />
                  <span
                    className={
                      stats.dealsCount >= 3 && (stats.ratingReceived ?? 0) >= 4
                        ? "text-gray-200"
                        : "text-gray-400"
                    }
                  >
                    Получите несколько положительных отзывов (4–5★) от покупателей
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      (stats.ratingReceived ?? 0) >= 4.5 && stats.dealsCount >= 5 ? "bg-[#7fffd4]" : "bg-gray-600"
                    }`}
                  />
                  <span
                    className={
                      (stats.ratingReceived ?? 0) >= 4.5 && stats.dealsCount >= 5
                        ? "text-gray-200"
                        : "text-gray-400"
                    }
                  >
                    Держите средний рейтинг выше 4.5★ и не срывайте сделки
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Сделки: покупки и продажи */}
          <section className="space-y-4">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 md:p-6">
              <h2 className="font-serif text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#7fffd4]" />
                Покупки
              </h2>
              {purchases.length === 0 ? (
                <p className="font-sans text-sm text-gray-400 mb-4">
                  Пока нет покупок. Заказы появятся здесь после оформления в каталоге.
                </p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {purchases.slice(0, 5).map((deal) => (
                    <li
                      key={deal.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#2a2a2a] bg-[#1111] px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <Link href={`/deal/${deal.id}`} className="font-sans text-sm text-white hover:text-[#7fffd4] truncate block">
                          {deal.title}
                        </Link>
                        <p className="font-sans text-xs text-gray-500">
                          {deal.sellerName} · {deal.total.toLocaleString("ru-RU")} ₽
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {deal.hasReview ? (
                          <span className="font-sans text-xs text-[#7fffd4] flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {deal.reviewRating}
                          </span>
                        ) : (deal.status === "paid" || deal.status === "completed") ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#2a2a2a] text-[#AFEEEE] hover:border-[#7fffd4] font-sans h-8 text-xs"
                            onClick={() => setReviewModal({ orderId: deal.id, title: deal.title })}
                          >
                            Оставить отзыв
                          </Button>
                        ) : null}
                        <Button size="sm" variant="ghost" asChild className="text-gray-400 h-8">
                          <Link href={`/deal/${deal.id}`}>Подробнее</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="outline" asChild className="border-[#2a2a2a] text-[#AFEEEE] hover:border-[#7fffd4] font-sans h-10 px-4 w-full sm:w-auto">
                <Link href="/orders">Все заказы</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 md:p-6">
              <h2 className="font-serif text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#7fffd4]" />
                Продажи
              </h2>
              {sales.length === 0 ? (
                <p className="font-sans text-sm text-gray-400 mb-4">
                  Пока нет продаж. Разместите лот в разделе «Продать».
                </p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {sales.slice(0, 5).map((deal) => (
                    <li
                      key={deal.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <Link href={`/deal/${deal.id}`} className="font-sans text-sm text-white hover:text-[#7fffd4] truncate block">
                          {deal.title}
                        </Link>
                        <p className="font-sans text-xs text-gray-500">
                          Покупатель: {deal.buyerName} · {deal.total.toLocaleString("ru-RU")} ₽
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" asChild className="text-gray-400 h-8">
                        <Link href={`/deal/${deal.id}`}>Подробнее</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="outline" asChild className="border-[#2a2a2a] text-[#AFEEEE] hover:border-[#7fffd4] font-sans h-10 px-4 w-full sm:w-auto">
                <Link href="/orders">Все заказы</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-5 md:p-6">
              <h3 className="font-serif text-base font-semibold text-white mb-1">
                Советы по безопасности
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs font-sans text-gray-400 list-disc list-inside">
                <li>Никому не передавайте пароль и коды подтверждения.</li>
                <li>Используйте уникальный пароль для Rampartx.</li>
                <li>Все сделки проводите только через интерфейс платформы.</li>
              </ul>
              <Link
                href="/security"
                className="inline-flex items-center mt-3 text-xs font-sans text-[#7fffd4] hover:text-[#AFEEEE]"
              >
                Подробнее о безопасности
              </Link>
            </div>
          </section>
        </div>
          </TabsContent>

          <TabsContent value="disputes" className="mt-0">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
              <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#7fffd4]" />
                Мои споры
              </h2>
              {disputes.length === 0 ? (
                <p className="font-sans text-sm text-gray-400">
                  У вас пока нет споров. Если возникнут разногласия по сделке, они будут отображаться здесь.
                </p>
              ) : (
                <ul className="space-y-3">
                  {disputes.map((dispute) => (
                    <li key={dispute.id} className="flex items-center justify-between gap-4 rounded-lg border border-[#2a2a2a] bg-[#1111] p-4">
                      <div className="min-w-0 flex-1">
                        <Link href={`/deal/${dispute.orderId}`} className="font-sans text-sm text-white hover:text-[#7fffd4] block">
                          {dispute.lotTitle}
                        </Link>
                        <p className="font-sans text-xs text-gray-500">
                          Спор #{dispute.id.substring(0, 8)} · {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                        </p>
                        <p className="font-sans text-xs text-gray-500">
                          {new Date(dispute.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild className="border-[#2a2a2a] font-sans">
                        <Link href={`/deal/${dispute.orderId}`}>Перейти к сделке</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
              <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#7fffd4]" />
                Избранное
              </h2>
              {favorites.length === 0 ? (
                <p className="font-sans text-sm text-gray-400">
                  Пока ничего нет. Добавляйте товары в избранное в каталоге (иконка сердца).
                </p>
              ) : (
                <ul className="space-y-3">
                  {favorites.map((lot) => (
                    <li key={lot.id} className="flex items-center gap-4 rounded-lg border border-[#2a2a2a] bg-[#111111] p-3">
                      {lot.image && (
                        <img src={lot.image} alt="" className="w-16 h-16 rounded object-cover shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <Link href={`/catalog/${lot.id}`} className="font-sans text-sm text-white hover:text-[#7fffd4]">
                          {lot.title}
                        </Link>
                        <p className="font-sans text-xs text-gray-500">
                          {lot.price.toLocaleString("ru-RU")} ₽ · {lot.seller.name}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild className="border-[#2a2a2a] font-sans">
                        <Link href={`/catalog/${lot.id}`}>Перейти</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 space-y-8">
              <h2 className="font-serif text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#7fffd4]" />
                Мои отзывы
              </h2>
              {reviewsAboutMe.length > 0 && (
                <div>
                  <h3 className="font-sans text-sm font-medium text-[#AFEEEE] mb-3">Отзывы обо мне (от покупателей)</h3>
                  <ul className="space-y-3">
                    {reviewsAboutMe.map((rev) => (
                      <li key={`about-${rev.id}`} className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Link href={`/deal/${rev.orderId}`} className="font-sans text-sm text-white hover:text-[#7fffd4]">
                            {rev.lotTitle}
                          </Link>
                          <span className="font-sans text-xs text-[#7fffd4] flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {rev.rating}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-gray-500">От: {rev.buyerName}</p>
                        {rev.comment && <p className="font-sans text-sm text-gray-400 mt-1">{rev.comment}</p>}
                        <p className="font-sans text-xs text-gray-500 mt-1">{rev.createdAt}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h3 className="font-sans text-sm font-medium text-[#AFEEEE] mb-3">Отзывы, которые я оставил</h3>
                {myReviews.length === 0 ? (
                  <p className="font-sans text-sm text-gray-400">
                    Вы ещё не оставляли отзывов. После завершения покупки можно оценить продавца.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {myReviews.map((rev) => (
                      <li key={rev.id} className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Link href={`/deal/${rev.orderId}`} className="font-sans text-sm text-white hover:text-[#7fffd4]">
                            {rev.lotTitle}
                          </Link>
                          <span className="font-sans text-xs text-[#7fffd4] flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {rev.rating}
                          </span>
                        </div>
                        {rev.comment && <p className="font-sans text-sm text-gray-400">{rev.comment}</p>}
                        <p className="font-sans text-xs text-gray-500 mt-1">{rev.createdAt}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
              <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#7fffd4]" />
                Настройки
              </h2>
              <p className="font-sans text-sm text-gray-400 mb-4">
                Смена пароля, уведомления и другие параметры аккаунта.
              </p>
              <Button asChild className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans">
                <Link href="/settings">Перейти в настройки</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="balance" className="mt-0">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
              <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#7fffd4]" />
                Баланс
              </h2>
              <p className="font-sans text-2xl text-[#7fffd4] font-semibold mb-2">
                {balance.toLocaleString("ru-RU")} ₽
              </p>
              <p className="font-sans text-sm text-gray-400 mb-4">
                Пополняйте баланс для быстрой оплаты заказов.
              </p>
              <Button asChild className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans">
                <Link href="/balance">Пополнить</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="my-lots" className="mt-0">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="font-serif text-lg font-semibold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#7fffd4]" />
                  Мои лоты
                </h2>
                <Button asChild className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans h-10 px-4 w-full sm:w-auto shrink-0">
                  <Link href="/create-lot">Создать лот</Link>
                </Button>
              </div>
              {myLots.length === 0 ? (
                <p className="font-sans text-sm text-gray-400 mb-4">
                  У вас пока нет лотов. Создайте первый в разделе «Продать товар».
                </p>
              ) : (
                <ul className="space-y-3">
                  {myLots.map((lot) => (
                    <li key={lot.id} className="flex items-center gap-4 rounded-lg border border-[#2a2a2a] bg-[#111111] p-3">
                      {lot.image && (
                        <img src={lot.image} alt="" className="w-16 h-16 rounded object-cover shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <Link href={`/catalog/${lot.id}`} className="font-sans text-sm text-white hover:text-[#7fffd4]">
                          {lot.title}
                        </Link>
                        <p className="font-sans text-xs text-gray-500">
                          {lot.price.toLocaleString("ru-RU")} ₽ · {lot.status === "published" ? "Опубликован" : lot.status}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild className="border-[#2a2a2a] font-sans">
                          <Link href={`/create-lot/${lot.id}`}>Редактировать</Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-sans"
                          onClick={async () => {
                            if (!confirm("Снять лот с публикации?")) return
                            const res = await fetch(`/api/lots/${lot.id}`, { method: "DELETE" })
                            if (res.ok) {
                              setMyLots((prev) => prev.filter((l) => l.id !== lot.id))
                              toast.success("Лот снят с публикации")
                            } else {
                              toast.error("Не удалось")
                            }
                          }}
                        >
                          Снять
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild className="mt-4 bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans">
                <Link href="/create-lot">Создать лот</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="active-sales" className="mt-0">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
              <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#7fffd4]" />
                Активные продажи
              </h2>
              {(() => {
                const st = (x: string) => (x || "").toLowerCase()
                const active = sales.filter((s) => st(s.status) === "pending" || st(s.status) === "paid")
                if (active.length === 0) {
                  return (
                    <p className="font-sans text-sm text-gray-400">
                      Нет активных продаж (ожидают оплаты или в работе).
                    </p>
                  )
                }
                return (
                  <ul className="space-y-2">
                    {active.map((deal) => (
                      <li
                        key={deal.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <Link href={`/deal/${deal.id}`} className="font-sans text-sm text-white hover:text-[#7fffd4] truncate block">
                            {deal.title}
                          </Link>
                          <p className="font-sans text-xs text-gray-500">
                            Покупатель: {deal.buyerName} · {deal.total.toLocaleString("ru-RU")} ₽ · {st(deal.status) === "paid" ? "Оплачен" : "Ожидает оплаты"}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" asChild className="text-gray-400 h-8">
                          <Link href={`/deal/${deal.id}`}>Сделка</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )
              })()}
              <Button variant="outline" asChild className="mt-4 border-[#2a2a2a] text-[#AFEEEE] hover:border-[#7fffd4] font-sans h-10 px-4">
                <Link href="/orders">Все заказы</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sales-history" className="mt-0">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
              <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-[#7fffd4]" />
                История продаж
              </h2>
              {(() => {
                const st = (x: string) => (x || "").toLowerCase()
                // paid считаем завершённой сделкой (в системе может не быть отдельного статуса completed)
                const completed = sales.filter((s) => st(s.status) === "completed" || st(s.status) === "cancelled" || st(s.status) === "paid")
                if (completed.length === 0) {
                  return (
                    <p className="font-sans text-sm text-gray-400">
                      Завершённых или отменённых продаж пока нет.
                    </p>
                  )
                }
                return (
                  <ul className="space-y-2">
                    {completed.map((deal) => (
                      <li
                        key={deal.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <Link href={`/deal/${deal.id}`} className="font-sans text-sm text-white hover:text-[#7fffd4] truncate block">
                            {deal.title}
                          </Link>
                          <p className="font-sans text-xs text-gray-500">
                            Покупатель: {deal.buyerName} · {deal.total.toLocaleString("ru-RU")} ₽ · {st(deal.status) === "completed" || st(deal.status) === "paid" ? "Завершён" : "Отменён"}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" asChild className="text-gray-400 h-8">
                          <Link href={`/deal/${deal.id}`}>Сделка</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )
              })()}
              <Button variant="outline" asChild className="mt-4 border-[#2a2a2a] text-[#AFEEEE] hover:border-[#7fffd4] font-sans h-10 px-4">
                <Link href="/orders">Все заказы</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="finance" className="mt-0">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
              <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#7fffd4]" />
                Финансы
              </h2>
              <p className="font-sans text-2xl text-[#7fffd4] font-semibold mb-2">
                Баланс: {balance.toLocaleString("ru-RU")} ₽
              </p>
              <p className="font-sans text-sm text-gray-400 mb-4">
                Текущий баланс. Выручка от продаж зачисляется после завершения сделки.
              </p>
              <Button asChild className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans">
                <Link href="/balance">Пополнить баланс</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
              <h2 className="font-serif text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#7fffd4]" />
                Статистика продавца
              </h2>
              {(() => {
                const st = (x: string) => (x || "").toLowerCase()
                // оплаченные (paid) и завершённые (completed) считаем завершёнными продажами
                const completedSales = sales.filter((s) => st(s.status) === "completed" || st(s.status) === "paid")
                const revenue = completedSales.reduce((sum, s) => sum + (s.total ?? 0), 0)
                const activeLots = myLots.filter((l) => st(l.status) === "published").length
                return (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] px-4 py-3">
                      <p className="font-sans text-xs text-gray-400 mb-1">Завершённых продаж</p>
                      <p className="font-serif text-2xl text-white">{completedSales.length}</p>
                    </div>
                    <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] px-4 py-3">
                      <p className="font-sans text-xs text-gray-400 mb-1">Выручка (завершённые)</p>
                      <p className="font-serif text-2xl text-[#7fffd4]">{revenue.toLocaleString("ru-RU")} ₽</p>
                    </div>
                    <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] px-4 py-3">
                      <p className="font-sans text-xs text-gray-400 mb-1">Активных лотов</p>
                      <p className="font-serif text-2xl text-white">{activeLots}</p>
                    </div>
                  </div>
                )
              })()}
              <p className="font-sans text-xs text-gray-500 mt-4">
                Рейтинг от покупателей: {stats.ratingReceived != null ? `${stats.ratingReceived} ★` : "—"}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!reviewModal} onOpenChange={(open) => !open && setReviewModal(null)}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle className="font-serif">Оставить отзыв</DialogTitle>
          </DialogHeader>
          {reviewModal && (
            <>
              <p className="font-sans text-sm text-gray-400">{reviewModal.title}</p>
              <div className="space-y-2">
                <Label className="text-gray-400 font-sans">Оценка (1–5)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      className={`w-10 h-10 rounded-lg border font-sans text-lg transition-colors ${
                        reviewRating >= n
                          ? "bg-[#7fffd4] text-black border-[#7fffd4]"
                          : "bg-[#111111] border-[#2a2a2a] text-gray-400 hover:border-[#7fffd4]/50"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400 font-sans">Комментарий (необязательно)</Label>
                <Textarea
                  placeholder="Напишите отзыв о продавце..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="min-h-[80px] bg-[#0a0a0a] border-[#2a2a2a] text-white font-sans resize-none"
                  maxLength={2000}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setReviewModal(null)}
                  className="border-[#2a2a2a] font-sans"
                >
                  Отмена
                </Button>
                <Button
                  onClick={submitReview}
                  disabled={reviewSubmitting}
                  className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans"
                >
                  {reviewSubmitting ? "Отправка..." : "Отправить отзыв"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

