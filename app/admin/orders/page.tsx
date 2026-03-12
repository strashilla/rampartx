"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface OrderRow {
  id: string
  lotId: string
  title: string
  buyerName: string
  sellerName: string
  total: number
  currency: string
  status: string
  createdAt: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("")

  function load() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.set("status", status)
    fetch(`/api/admin/orders?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setOrders(data?.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page, status])

  const formatDate = (s: string) => {
    if (!s) return "—"
    try {
      const d = new Date(s)
      return isNaN(d.getTime()) ? s : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
    } catch {
      return s
    }
  }

  const statusLabel: Record<string, string> = {
    pending: "Ожидание",
    paid: "Оплачен",
    completed: "Завершён",
    cancelled: "Отменён",
  }

  return (
    <div className="max-w-5xl mx-auto pt-8">
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Сделки</h1>
      <p className="font-sans text-sm text-[#AFEEEE] mb-6">Список заказов со статусами</p>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="font-sans text-xs text-[#6B7280] block mb-1">Статус</label>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="rounded-lg border border-[#2a2a2a] bg-[#111111] text-white font-sans text-sm px-3 py-2 min-w-[140px]"
          >
            <option value="">Все</option>
            <option value="pending">Ожидание</option>
            <option value="paid">Оплачен</option>
            <option value="completed">Завершён</option>
            <option value="cancelled">Отменён</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="font-sans text-[#6B7280]">Загрузка...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="font-sans text-[#6B7280]">Нет заказов</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a] text-left text-[#6B7280]">
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Лот</th>
                  <th className="p-3 font-medium">Покупатель</th>
                  <th className="p-3 font-medium">Продавец</th>
                  <th className="p-3 font-medium">Сумма</th>
                  <th className="p-3 font-medium">Статус</th>
                  <th className="p-3 font-medium">Дата</th>
                  <th className="p-3 font-medium">Сделка</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#111111]/50">
                    <td className="p-3 text-white">{o.id}</td>
                    <td className="p-3 text-white max-w-[180px] truncate" title={o.title}>{o.title}</td>
                    <td className="p-3 text-[#AFEEEE]">{o.buyerName || "—"}</td>
                    <td className="p-3 text-[#AFEEEE]">{o.sellerName || "—"}</td>
                    <td className="p-3 text-white">{o.total} {o.currency}</td>
                    <td className="p-3">
                      <span className={
                        o.status === "completed" ? "text-[#7fffd4]" :
                        o.status === "cancelled" ? "text-red-400" : "text-[#AFEEEE]"
                      }>
                        {statusLabel[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="p-3 text-[#6B7280]">{formatDate(o.createdAt)}</td>
                    <td className="p-3">
                      <Link href={`/deal/${o.id}`} className="font-sans text-sm text-[#7fffd4] hover:text-[#AFEEEE] transition-colors">
                        Сделка →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center gap-2 p-3 border-t border-[#2a2a2a]">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border border-[#2a2a2a] text-white disabled:opacity-50 hover:bg-[#1a1a1a]"
            >
              Назад
            </button>
            <span className="px-3 py-1 text-[#6B7280] font-sans text-sm">Стр. {page}</span>
            <button
              type="button"
              disabled={orders.length < 50}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-[#2a2a2a] text-white disabled:opacity-50 hover:bg-[#1a1a1a]"
            >
              Далее
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
