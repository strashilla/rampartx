"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, Loader2, ShoppingBag, CreditCard, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Order {
  id: string
  title?: string
  description?: string
  price?: number
  total?: number
  currency?: string
  sellerName?: string
  status: string
  createdAt?: string
}

export function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [openingChatId, setOpeningChatId] = useState<string | null>(null)

  const loadOrders = () => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  async function handlePay(orderId: string) {
    setPayingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Ошибка оплаты")
        return
      }
      toast.success("Оплачено")
      loadOrders()
    } finally {
      setPayingId(null)
    }
  }

  async function handleOpenChat(orderId: string) {
    setOpeningChatId(orderId)
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось открыть чат")
        return
      }
      window.location.href = `/chat/${data.chatId}`
    } finally {
      setOpeningChatId(null)
    }
  }

  const formatPrice = (price: number | undefined, currency: string | undefined) => {
    const symbols: Record<string, string> = {
      RUB: "₽",
      USD: "$",
      EUR: "€",
    }
    const value = Number(price)
    if (Number.isNaN(value)) return "—"
    return `${value.toLocaleString("ru-RU")} ${symbols[currency ?? "RUB"] ?? currency ?? "₽"}`
  }

  const statusLabel: Record<string, string> = {
    pending: "Ожидает оплаты",
    paid: "Оплачен",
    completed: "Выполнен",
    cancelled: "Отменён",
    sold: "Оплачен",
    draft: "Черновик",
    published: "Опубликован",
    archived: "В архиве",
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-28">
        <Loader2 className="h-10 w-10 animate-spin text-[#7fffd4]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
            Мои заказы
          </h1>
          <p className="text-[#AFEEEE] font-sans text-sm">
            Покупки по сделкам на Rampartx
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-12 text-center">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="font-sans text-gray-400 mb-2">Пока нет заказов</p>
            <p className="font-sans text-sm text-gray-500 mb-6">
              Оформите покупку в каталоге — здесь появятся ваши сделки
            </p>
            <Button asChild className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans">
              <Link href="/catalog">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Перейти в каталог
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-lg font-semibold text-white truncate">
                    {order.title ?? "Заказ"}
                  </h2>
                  <p className="font-sans text-sm text-gray-400 mt-0.5">
                    Продавец: {order.sellerName ?? "—"}
                  </p>
                  <p className="font-sans text-[#7fffd4] font-medium mt-2">
                    {formatPrice(order.price ?? order.total, order.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[#7fffd4]/20 text-[#7fffd4] font-sans text-sm">
                    {statusLabel[order.status] ?? order.status}
                  </span>
                  {order.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handlePay(order.id)}
                      disabled={payingId !== null}
                      className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans"
                    >
                      {payingId === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-1.5" />
                          Оплатить
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenChat(order.id)}
                    disabled={openingChatId !== null}
                    className="border-[#2a2a2a] text-[#AFEEEE] hover:border-[#7fffd4] font-sans"
                  >
                    {openingChatId === order.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><MessageCircle className="w-4 h-4 mr-1.5" />Чат</>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" asChild className="border-[#2a2a2a] text-[#AFEEEE] hover:border-[#7fffd4] font-sans">
                    <Link href={`/deal/${order.id}`}>Подробнее</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
