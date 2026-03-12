"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Package, CreditCard, MessageCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const statusLabel: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  completed: "Выполнен",
  cancelled: "Отменён",
}

export function DealContent({ dealId }: { dealId: string }) {
  const [deal, setDeal] = useState<{
    id: string
    title?: string
    description?: string
    price?: number
    total?: number
    quantity?: number
    currency?: string
    sellerName?: string
    buyerName?: string
    status: string
    isBuyer?: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [openingChat, setOpeningChat] = useState(false)
  const [hasDispute, setHasDispute] = useState(false)
  const [openingDispute, setOpeningDispute] = useState(false)
  const [evidence, setEvidence] = useState<{ id: string; username: string; content: string; createdAt: string; isOwn: boolean }[]>([])
  const [evidenceText, setEvidenceText] = useState("")
  const [evidenceSubmitting, setEvidenceSubmitting] = useState(false)

  const loadDeal = () => {
    fetch(`/api/orders/${dealId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error || !data.id) {
          setDeal(null)
          return
        }
        setDeal({
          id: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          total: data.total,
          quantity: data.quantity,
          currency: data.currency,
          sellerName: data.sellerName,
          buyerName: data.buyerName,
          status: data.status,
          isBuyer: data.isBuyer,
        })
      })
      .catch(() => setDeal(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDeal()
  }, [dealId])

  useEffect(() => {
    if (!dealId) return
    fetch("/api/disputes")
      .then((r) => r.json())
      .then((data) => {
        const list = data?.disputes ?? []
        const has = list.some((d: { orderId: string }) => String(d.orderId) === String(dealId))
        setHasDispute(has)
        if (has) {
          fetch(`/api/orders/${dealId}/dispute/evidence`)
            .then((res) => res.json())
            .then((d) => setEvidence(d?.evidence ?? []))
            .catch(() => setEvidence([]))
        } else {
          setEvidence([])
        }
      })
      .catch(() => {})
  }, [dealId])

  async function addEvidence() {
    if (!evidenceText.trim()) return
    setEvidenceSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${dealId}/dispute/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: evidenceText.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось добавить")
        return
      }
      toast.success("Доказательство добавлено")
      setEvidenceText("")
      const listRes = await fetch(`/api/orders/${dealId}/dispute/evidence`)
      const listData = await listRes.json().catch(() => ({}))
      setEvidence(listData?.evidence ?? [])
    } finally {
      setEvidenceSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-28">
        <Loader2 className="h-10 w-10 animate-spin text-[#7fffd4]" />
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="container mx-auto px-4 py-12 pt-28 max-w-2xl">
        <p className="font-sans text-gray-400 mb-4">Сделка не найдена</p>
        <Button asChild variant="outline" className="border-[#2a2a2a] text-[#AFEEEE] font-sans">
          <Link href="/orders"><ArrowLeft className="w-4 h-4 mr-2" />К заказам</Link>
        </Button>
      </div>
    )
  }

  const formatPrice = (price: number | undefined, currency: string | undefined) => {
    const symbols: Record<string, string> = { RUB: "₽", USD: "$", EUR: "€" }
    const value = Number(price)
    if (Number.isNaN(value)) return "—"
    return `${value.toLocaleString("ru-RU")} ${symbols[currency ?? "RUB"] ?? currency ?? "₽"}`
  }

  async function handlePay() {
    if (!deal || deal.status !== "pending") return
    setPaying(true)
    try {
      const res = await fetch(`/api/orders/${deal.id}/pay`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Ошибка оплаты")
        return
      }
      toast.success("Оплачено")
      loadDeal()
    } finally {
      setPaying(false)
    }
  }

  async function openDispute() {
    if (!deal) return
    setOpeningDispute(true)
    try {
      const res = await fetch(`/api/orders/${deal.id}/dispute`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось открыть спор")
        return
      }
      toast.success("Спор открыт. Модерация рассмотрит обращение.")
      setHasDispute(true)
    } finally {
      setOpeningDispute(false)
    }
  }

  async function openChat() {
    if (!deal) return
    setOpeningChat(true)
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: deal.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось открыть чат")
        return
      }
      window.location.href = `/chat/${data.chatId}`
    } finally {
      setOpeningChat(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 pt-28 max-w-2xl">
      <Button asChild variant="ghost" size="sm" className="mb-6 text-[#AFEEEE] hover:text-[#7fffd4] font-sans">
        <Link href="/orders"><ArrowLeft className="w-4 h-4 mr-2" />Мои заказы</Link>
      </Button>
      <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#7fffd4]/20 flex items-center justify-center">
            <Package className="w-6 h-6 text-[#7fffd4]" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-white">{deal.title ?? "Заказ"}</h1>
            <p className="font-sans text-sm text-gray-400">
            {deal.isBuyer ? `Продавец: ${deal.sellerName ?? "—"}` : `Покупатель: ${deal.buyerName ?? "—"}`}
          </p>
          </div>
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-[#7fffd4]/20 text-[#7fffd4] font-sans text-sm mb-4">
          {statusLabel[deal.status] ?? deal.status}
        </span>
        {(deal.quantity != null && deal.quantity > 1) && (
          <p className="font-sans text-sm text-gray-400 mb-1">
            Количество: {deal.quantity} шт.
          </p>
        )}
        <p className="font-sans text-[#7fffd4] font-semibold text-lg mb-4">
          Сумма: {formatPrice(deal.price ?? deal.total, deal.currency)}
        </p>
        {deal.description && (
          <p className="font-sans text-gray-400 text-sm whitespace-pre-wrap mb-6">
            {deal.description}
          </p>
        )}
        {deal.status === "pending" && deal.isBuyer && (
          <Button
            onClick={handlePay}
            disabled={paying}
            className="mb-4 bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans"
          >
            {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" />Оплатить</>}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={openChat}
          disabled={openingChat}
          className="mb-4 border-[#2a2a2a] text-[#AFEEEE] hover:border-[#7fffd4] hover:text-[#7fffd4] font-sans"
        >
          {openingChat ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageCircle className="w-4 h-4 mr-2" />}
          {deal.isBuyer ? "Написать продавцу" : "Написать покупателю"}
        </Button>
        {(deal.status === "paid" || deal.status === "completed") && (
          hasDispute ? (
            <div className="mt-4 space-y-3">
              <p className="font-sans text-sm text-[#7fffd4] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Спор по сделке открыт. Добавьте доказательства:
              </p>
              <div className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-3">
                <textarea
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder="Текст доказательства..."
                  rows={3}
                  className="w-full rounded border border-[#2a2a2a] bg-[#0a0a0a] text-white font-sans text-sm p-2 resize-none"
                />
                <Button
                  type="button"
                  onClick={addEvidence}
                  disabled={evidenceSubmitting || !evidenceText.trim()}
                  className="mt-2 bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans text-sm"
                >
                  {evidenceSubmitting ? "..." : "Добавить доказательство"}
                </Button>
              </div>
              {evidence.length > 0 && (
                <ul className="space-y-2">
                  {evidence.map((e) => (
                    <li key={e.id} className={`rounded-lg border p-3 text-sm ${e.isOwn ? "border-[#7fffd4]/30 bg-[#7fffd4]/5" : "border-[#2a2a2a] bg-[#111111]"}`}>
                      <span className="text-[#6B7280] font-sans">{e.username} · {new Date(e.createdAt).toLocaleString("ru-RU")}</span>
                      <p className="font-sans text-white mt-1 whitespace-pre-wrap">{e.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={openDispute}
              disabled={openingDispute}
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-sans"
            >
              {openingDispute ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
              Открыть спор
            </Button>
          )
        )}
      </div>
    </div>
  )
}
