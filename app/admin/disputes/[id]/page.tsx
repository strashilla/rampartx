"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

interface EvidenceItem {
  id: string
  username: string
  content: string
  createdAt: string
  side: string
}

interface DisputeDetail {
  id: string
  orderId: string
  openerName: string
  status: string
  adminDecision?: string
  createdAt: string
  lotTitle: string
  buyerName: string
  sellerName: string
  evidence: EvidenceItem[]
}

export default function AdminDisputeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [dispute, setDispute] = useState<DisputeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/disputes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setDispute(null)
        else setDispute(data)
      })
      .catch(() => setDispute(null))
      .finally(() => setLoading(false))
  }, [id])

  async function closeDispute(status: string) {
    if (!id) return
    setClosing(true)
    try {
      const res = await fetch(`/api/admin/disputes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminDecision: `Закрыто: ${status}` }),
      })
      if (!res.ok) return
      setDispute((prev) => (prev ? { ...prev, status } : null))
    } finally {
      setClosing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pt-8">
        <p className="font-sans text-[#6B7280]">Загрузка...</p>
      </div>
    )
  }

  if (!dispute) {
    return (
      <div className="max-w-4xl mx-auto pt-8">
        <p className="font-sans text-red-400 mb-4">Спор не найден</p>
        <Link href="/admin/disputes" className="font-sans text-[#7fffd4] hover:text-[#AFEEEE]">
          ← К списку споров
        </Link>
      </div>
    )
  }

  const buyerEvidence = dispute.evidence.filter((e) => e.side === "buyer")
  const sellerEvidence = dispute.evidence.filter((e) => e.side === "seller")

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <Link href="/admin/disputes" className="font-sans text-sm text-[#7fffd4] hover:text-[#AFEEEE] mb-4 inline-block">
        ← К списку споров
      </Link>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Спор #{dispute.id}</h1>
      <p className="font-sans text-sm text-[#AFEEEE] mb-6">
        Заказ #{dispute.orderId} · {dispute.lotTitle}
      </p>

      <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 mb-6">
        <p className="font-sans text-[#6B7280] text-sm">
          Открыл: <span className="text-white">{dispute.openerName}</span> · Покупатель: <span className="text-white">{dispute.buyerName}</span> · Продавец: <span className="text-white">{dispute.sellerName}</span>
        </p>
        <p className="font-sans text-sm mt-1">
          Статус: <span className="text-[#7fffd4]">{dispute.status}</span> · {new Date(dispute.createdAt).toLocaleString("ru-RU")}
        </p>
        <Link href={`/deal/${dispute.orderId}`} className="inline-block mt-2 font-sans text-sm text-[#7fffd4] hover:text-[#AFEEEE]">
          Сделка →
        </Link>
        {dispute.status === "open" && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={closing}
              onClick={() => closeDispute("resolved")}
              className="px-4 py-2 rounded-lg bg-[#7fffd4] text-black font-sans font-medium hover:bg-[#40E0D0] disabled:opacity-50"
            >
              {closing ? "..." : "Закрыть спор"}
            </button>
          </div>
        )}
      </div>

      <h2 className="font-sans text-lg font-medium text-white mb-3">Доказательства</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <h3 className="font-sans font-medium text-[#7fffd4] mb-3">Покупатель ({dispute.buyerName})</h3>
          {buyerEvidence.length === 0 ? (
            <p className="font-sans text-sm text-[#6B7280]">Нет сообщений</p>
          ) : (
            <ul className="space-y-2">
              {buyerEvidence.map((e) => (
                <li key={e.id} className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-3 text-sm">
                  <span className="text-[#6B7280]">{e.username} · {new Date(e.createdAt).toLocaleString("ru-RU")}</span>
                  <p className="text-white mt-1 whitespace-pre-wrap">{e.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <h3 className="font-sans font-medium text-[#7fffd4] mb-3">Продавец ({dispute.sellerName})</h3>
          {sellerEvidence.length === 0 ? (
            <p className="font-sans text-sm text-[#6B7280]">Нет сообщений</p>
          ) : (
            <ul className="space-y-2">
              {sellerEvidence.map((e) => (
                <li key={e.id} className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-3 text-sm">
                  <span className="text-[#6B7280]">{e.username} · {new Date(e.createdAt).toLocaleString("ru-RU")}</span>
                  <p className="text-white mt-1 whitespace-pre-wrap">{e.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
