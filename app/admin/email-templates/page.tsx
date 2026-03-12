"use client"

import { useEffect, useState } from "react"

interface Template {
  code: string
  subject: string
  body: string
  updatedAt?: string
}

const codeLabels: Record<string, string> = {
  register: "Подтверждение регистрации",
  reset_password: "Сброс пароля",
  order_created: "Новый заказ",
  dispute_opened: "Открыт спор",
}

export default function AdminEmailTemplatesPage() {
  const [list, setList] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState("")
  const [editBody, setEditBody] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function load() {
    setLoading(true)
    fetch("/api/admin/email-templates")
      .then((r) => r.json())
      .then((data) => setList(data?.templates ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(t: Template) {
    setEditing(t.code)
    setEditSubject(t.subject)
    setEditBody(t.body)
    setError("")
  }

  function cancelEdit() {
    setEditing(null)
    setError("")
  }

  async function saveEdit(code: string) {
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/email-templates/${encodeURIComponent(code)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: editSubject, body: editBody }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? "Ошибка")
        return
      }
      setEditing(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pt-8">
        <p className="font-sans text-[#6B7280]">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Email-шаблоны</h1>
      <p className="font-sans text-sm text-[#AFEEEE] mb-6">
        Настройка тем и текстов писем. Переменные: &#123;&#123;username&#125;&#125;, &#123;&#123;resetLink&#125;&#125;, &#123;&#123;orderId&#125;&#125; и т.д.
      </p>

      {error && <p className="font-sans text-sm text-red-400 mb-4">{error}</p>}

      {list.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="font-sans text-[#6B7280]">Нет шаблонов. Выполните sql/migration-email-templates.sql</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((t) => (
            <li key={t.code} className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
              <h2 className="font-sans font-medium text-white">
                {codeLabels[t.code] ?? t.code} <span className="text-[#6B7280] font-normal">({t.code})</span>
              </h2>
              {editing === t.code ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="font-sans text-xs text-[#6B7280] block mb-1">Тема</label>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full rounded-lg border border-[#2a2a2a] bg-[#111111] text-white font-sans text-sm px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-[#6B7280] block mb-1">Текст письма</label>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-[#2a2a2a] bg-[#111111] text-white font-sans text-sm px-3 py-2 resize-y"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(t.code)}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-[#7fffd4] text-black font-sans font-medium hover:bg-[#40E0D0] disabled:opacity-50"
                    >
                      {saving ? "..." : "Сохранить"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-lg border border-[#2a2a2a] text-[#6B7280] font-sans hover:bg-[#111111]"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-sans text-sm text-[#AFEEEE] mt-1">Тема: {t.subject || "—"}</p>
                  <p className="font-sans text-sm text-[#6B7280] mt-2 whitespace-pre-wrap line-clamp-3">{t.body || "—"}</p>
                  <button
                    type="button"
                    onClick={() => startEdit(t)}
                    className="mt-3 font-sans text-sm text-[#7fffd4] hover:text-[#AFEEEE]"
                  >
                    Редактировать
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
