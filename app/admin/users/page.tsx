"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface UserRow {
  id: string
  username: string
  email: string
  role: string
  createdAt: string
  lotsCount: number
  ordersCount: number
  avgRating: number | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (role) params.set("role", role)
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)
    fetch(`/api/admin/users?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setUsers(data?.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [role, dateFrom, dateTo])

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
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Пользователи</h1>
      <p className="font-sans text-sm text-[#AFEEEE] mb-6">Список пользователей с фильтрами и статистикой</p>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="font-sans text-xs text-[#6B7280] block mb-1">Роль</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-[#2a2a2a] bg-[#111111] text-white font-sans text-sm px-3 py-2 min-w-[120px]"
          >
            <option value="">Все</option>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <label className="font-sans text-xs text-[#6B7280] block mb-1">Дата регистрации от</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-[#2a2a2a] bg-[#111111] text-white font-sans text-sm px-3 py-2"
          />
        </div>
        <div>
          <label className="font-sans text-xs text-[#6B7280] block mb-1">до</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-[#2a2a2a] bg-[#111111] text-white font-sans text-sm px-3 py-2"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="font-sans text-[#6B7280]">Загрузка...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="font-sans text-[#6B7280]">Нет пользователей</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a] text-left text-[#6B7280]">
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Имя</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Роль</th>
                  <th className="p-3 font-medium">Регистрация</th>
                  <th className="p-3 font-medium">Лоты</th>
                  <th className="p-3 font-medium">Заказы</th>
                  <th className="p-3 font-medium">Рейтинг</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#111111]/50">
                    <td className="p-3 text-white">{u.id}</td>
                    <td className="p-3 text-white">{u.username || "—"}</td>
                    <td className="p-3 text-[#AFEEEE]">{u.email || "—"}</td>
                    <td className="p-3">
                      <span className={u.role === "admin" ? "text-[#7fffd4]" : "text-white"}>{u.role}</span>
                    </td>
                    <td className="p-3 text-[#6B7280]">{formatDate(u.createdAt)}</td>
                    <td className="p-3 text-white">{u.lotsCount}</td>
                    <td className="p-3 text-white">{u.ordersCount}</td>
                    <td className="p-3 text-[#7fffd4]">{u.avgRating != null ? u.avgRating : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
