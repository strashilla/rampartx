"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface LotRow {
  id: string
  title: string
  sellerName: string
  category: string
  price: number
  currency: string
  status: string
  createdAt: string
}

const categoryLabels: Record<string, string> = {
  steam: "Steam аккаунты",
  discord: "Discord аккаунты",
  epic: "Epic Games",
  keys: "Игровые ключи",
  items: "Внутриигровые предметы",
  software: "Программное обеспечение",
}

export default function AdminLotsPage() {
  const [lots, setLots] = useState<LotRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")

  function load() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (category) params.set("category", category)
    if (status) params.set("status", status)
    fetch(`/api/admin/lots?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setLots(data?.lots ?? []))
      .catch(() => setLots([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page, category, status])

  const formatDate = (s: string) => {
    if (!s) return "—"
    try {
      const d = new Date(s)
      return isNaN(d.getTime()) ? s : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
    } catch {
      return s
    }
  }

  return (
    <div className="max-w-5xl mx-auto pt-8">
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Лоты</h1>
      <p className="font-sans text-sm text-[#AFEEEE] mb-6">Все лоты в таблице</p>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="font-sans text-xs text-[#6B7280] block mb-1">Категория</label>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            className="rounded-lg border border-[#2a2a2a] bg-[#111111] text-white font-sans text-sm px-3 py-2 min-w-[160px]"
          >
            <option value="">Все</option>
            {Object.entries(categoryLabels).map(([slug, label]) => (
              <option key={slug} value={slug}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-sans text-xs text-[#6B7280] block mb-1">Статус</label>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="rounded-lg border border-[#2a2a2a] bg-[#111111] text-white font-sans text-sm px-3 py-2 min-w-[120px]"
          >
            <option value="">Все</option>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="font-sans text-[#6B7280]">Загрузка...</p>
        </div>
      ) : lots.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="font-sans text-[#6B7280]">Нет лотов</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a] text-left text-[#6B7280]">
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Название</th>
                  <th className="p-3 font-medium">Продавец</th>
                  <th className="p-3 font-medium">Категория</th>
                  <th className="p-3 font-medium">Цена</th>
                  <th className="p-3 font-medium">Статус</th>
                  <th className="p-3 font-medium">Дата</th>
                  <th className="p-3 font-medium">Ссылка</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <tr key={lot.id} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#111111]/50">
                    <td className="p-3 text-white">{lot.id}</td>
                    <td className="p-3 text-white max-w-[200px] truncate" title={lot.title}>{lot.title}</td>
                    <td className="p-3 text-[#AFEEEE]">{lot.sellerName || "—"}</td>
                    <td className="p-3 text-[#6B7280]">{categoryLabels[lot.category] || lot.category || "—"}</td>
                    <td className="p-3 text-white">{lot.price} {lot.currency}</td>
                    <td className="p-3">
                      <span className={lot.status === "published" ? "text-[#7fffd4]" : "text-[#6B7280]"}>{lot.status}</span>
                    </td>
                    <td className="p-3 text-[#6B7280]">{formatDate(lot.createdAt)}</td>
                    <td className="p-3">
                      <Link href={`/catalog/${lot.id}`} className="font-sans text-sm text-[#7fffd4] hover:text-[#AFEEEE] transition-colors">
                        В каталог →
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
              disabled={lots.length < 50}
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
