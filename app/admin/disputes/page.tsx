"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Dispute {
  id: string
  orderId: string
  openerName: string
  status: string
  adminDecision?: string
  createdAt: string
  lotTitle: string
}

export default function AdminDisputesPage() {
  const [list, setList] = useState<Dispute[]>([])
  const [resolving, setResolving] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/disputes")
      .then((r) => r.json())
      .then((data) => setList(data?.disputes ?? []))
      .catch(() => setList([]))
  }, [])

  async function resolve(id: string, status: string) {
    setResolving(id)
    try {
      await fetch(`/api/admin/disputes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminDecision: `Решение: ${status}` }),
      })
      setList((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)))
    } finally {
      setResolving(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Споры</h1>
      <p className="font-sans text-sm text-[#AFEEEE] mb-6">Просмотр и закрытие споров по сделкам</p>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="font-sans text-[#6B7280]">Нет споров</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((d) => (
            <li key={d.id} className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="font-sans font-medium text-white">{d.lotTitle}</p>
                  <p className="font-sans text-sm text-[#6B7280] mt-1">
                    Заказ #{d.orderId} · Открыл: {d.openerName} · {d.createdAt}
                  </p>
                  <p className="font-sans text-sm mt-1">
                    Статус: <span className="text-[#7fffd4]">{d.status}</span>
                  </p>
                  <div className="flex gap-3 mt-2">
                    <Link href={`/admin/disputes/${d.id}`} className="font-sans text-sm text-[#7fffd4] hover:text-[#AFEEEE] transition-colors">
                      Доказательства →
                    </Link>
                    <Link href={`/deal/${d.orderId}`} className="font-sans text-sm text-[#7fffd4] hover:text-[#AFEEEE] transition-colors">
                      Сделка →
                    </Link>
                  </div>
                </div>
                {d.status === "open" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={resolving === d.id}
                      onClick={() => resolve(d.id, "resolved")}
                      className="px-4 py-2 rounded-lg bg-[#7fffd4] text-black font-sans font-medium hover:bg-[#40E0D0] transition-colors disabled:opacity-50"
                    >
                      {resolving === d.id ? "..." : "Закрыть"}
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8">
        <Link href="/admin" className="font-sans text-sm text-[#7fffd4] hover:text-[#AFEEEE] transition-colors">
          ← Дашборд
        </Link>
      </p>
    </div>
  )
}
