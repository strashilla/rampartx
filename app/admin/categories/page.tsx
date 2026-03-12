"use client"

import { useEffect, useState } from "react"

interface Category {
  id: string
  slug: string
  label: string
  sortOrder: number
}

export default function AdminCategoriesPage() {
  const [list, setList] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState("")
  const [label, setLabel] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSlug, setEditSlug] = useState("")
  const [editLabel, setEditLabel] = useState("")

  function load() {
    setLoading(true)
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setList(data?.categories ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim(), label: label.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "Ошибка")
        return
      }
      setSlug("")
      setLabel("")
      load()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(id: string) {
    if (!editSlug.trim() && !editLabel.trim()) return
    setError("")
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: editSlug.trim() || undefined,
          label: editLabel.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "Ошибка")
        return
      }
      setEditingId(null)
      load()
    } catch {
      setError("Ошибка запроса")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить категорию?")) return
    setError("")
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "Ошибка")
        return
      }
      load()
    } catch {
      setError("Ошибка запроса")
    }
  }

  function startEdit(c: Category) {
    setEditingId(c.id)
    setEditSlug(c.slug)
    setEditLabel(c.label)
    setError("")
  }

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Категории</h1>
      <p className="font-sans text-sm text-[#AFEEEE] mb-6">Управление категориями товаров</p>

      <form onSubmit={handleAdd} className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 mb-6">
        <h2 className="font-sans font-medium text-white mb-3">Добавить категорию</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="font-sans text-xs text-[#6B7280] block mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="например new-cat"
              className="rounded-lg border border-[#2a2a2a] bg-[#111111] text-white font-sans text-sm px-3 py-2 w-40"
            />
          </div>
          <div>
            <label className="font-sans text-xs text-[#6B7280] block mb-1">Название</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Название категории"
              className="rounded-lg border border-[#2a2a2a] bg-[#111111] text-white font-sans text-sm px-3 py-2 w-56"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !slug.trim() || !label.trim()}
            className="px-4 py-2 rounded-lg bg-[#7fffd4] text-black font-sans font-medium hover:bg-[#40E0D0] transition-colors disabled:opacity-50"
          >
            {submitting ? "..." : "Добавить категорию"}
          </button>
        </div>
      </form>

      {error && (
        <p className="font-sans text-sm text-red-400 mb-4">{error}</p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="font-sans text-[#6B7280]">Загрузка...</p>
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="font-sans text-[#6B7280]">Нет категорий. Выполните sql/migration-categories.sql</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a] text-left text-[#6B7280]">
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Slug</th>
                  <th className="p-3 font-medium">Название</th>
                  <th className="p-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#111111]/50">
                    <td className="p-3 text-white">{c.id}</td>
                    {editingId === c.id ? (
                      <>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editSlug}
                            onChange={(e) => setEditSlug(e.target.value)}
                            className="rounded border border-[#2a2a2a] bg-[#111111] text-white px-2 py-1 w-32 text-sm"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="rounded border border-[#2a2a2a] bg-[#111111] text-white px-2 py-1 w-48 text-sm"
                          />
                        </td>
                        <td className="p-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(c.id)}
                            className="text-[#7fffd4] hover:text-[#AFEEEE] font-sans text-sm"
                          >
                            Сохранить
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-[#6B7280] hover:text-white font-sans text-sm"
                          >
                            Отмена
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 text-[#AFEEEE]">{c.slug}</td>
                        <td className="p-3 text-white">{c.label}</td>
                        <td className="p-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="text-[#7fffd4] hover:text-[#AFEEEE] font-sans text-sm"
                          >
                            Редактировать
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            className="text-red-400 hover:text-red-300 font-sans text-sm"
                          >
                            Удалить
                          </button>
                        </td>
                      </>
                    )}
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
