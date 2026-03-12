"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminPage() {
  const [stats, setStats] = useState<{
    platformBalance?: number
    usersCount?: number
    lotsCount?: number
    ordersCount?: number
    disputesOpen?: number
  } | null>(null)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8 pt-8">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">Панель администратора</h1>
        <p className="font-sans text-sm text-[#AFEEEE]">Обзор платформы и быстрые действия</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
          <p className="font-sans text-xs text-[#6B7280] mb-1">Баланс платформы</p>
          <p className="font-mono text-2xl font-semibold text-[#7fffd4]">{(stats?.platformBalance ?? 0).toLocaleString("ru-RU")} ₽</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
          <p className="font-sans text-xs text-[#6B7280] mb-1">Пользователи</p>
          <p className="font-mono text-2xl font-semibold text-white">{stats?.usersCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
          <p className="font-sans text-xs text-[#6B7280] mb-1">Лоты</p>
          <p className="font-mono text-2xl font-semibold text-white">{stats?.lotsCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
          <p className="font-sans text-xs text-[#6B7280] mb-1">Заказы</p>
          <p className="font-mono text-2xl font-semibold text-white">{stats?.ordersCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
          <p className="font-sans text-xs text-[#6B7280] mb-1">Открытые споры</p>
          <p className="font-mono text-2xl font-semibold text-white">{stats?.disputesOpen ?? 0}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
        <h2 className="font-serif text-lg font-semibold text-white mb-4">Действия</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/users"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#7fffd4] text-black font-sans font-medium hover:bg-[#40E0D0] transition-colors"
          >
            Пользователи
          </Link>
          <Link
            href="/admin/lots"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#7fffd4] text-black font-sans font-medium hover:bg-[#40E0D0] transition-colors"
          >
            Лоты
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#7fffd4] text-black font-sans font-medium hover:bg-[#40E0D0] transition-colors"
          >
            Сделки
          </Link>
          <Link
            href="/admin/disputes"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#7fffd4] text-black font-sans font-medium hover:bg-[#40E0D0] transition-colors"
          >
            Споры
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center px-5 py-2.5 rounded-lg border border-[#2a2a2a] text-[#AFEEEE] font-sans font-medium hover:border-[#7fffd4] hover:text-[#7fffd4] transition-colors"
          >
            Категории
          </Link>
          <Link
            href="/admin/email-templates"
            className="inline-flex items-center px-5 py-2.5 rounded-lg border border-[#2a2a2a] text-[#AFEEEE] font-sans font-medium hover:border-[#7fffd4] hover:text-[#7fffd4] transition-colors"
          >
            Email-шаблоны
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center px-5 py-2.5 rounded-lg border border-[#2a2a2a] text-[#AFEEEE] font-sans font-medium hover:border-[#7fffd4] hover:text-[#7fffd4] transition-colors"
          >
            Настройки комиссии
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 rounded-lg text-[#6B7280] font-sans text-sm hover:text-[#AFEEEE] transition-colors"
          >
            ← На главную
          </Link>
        </div>
      </div>
    </div>
  )
}
