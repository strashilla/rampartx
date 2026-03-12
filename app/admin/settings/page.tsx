"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminSettingsPage() {
  const [commission, setCommission] = useState("5")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.commission_percent != null) setCommission(String(data.commission_percent))
      })
      .catch(() => {})
  }, [])

  async function save() {
    setSaving(true)
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commission_percent: commission }),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md mx-auto pt-8">
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Настройки</h1>
      <p className="font-sans text-sm text-[#AFEEEE] mb-6">Комиссия платформы и параметры</p>
      <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 space-y-5">
        <div>
          <Label className="font-sans text-sm text-[#6B7280]">Комиссия платформы (%)</Label>
          <Input
            type="number"
            min={0}
            max={10}
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            className="mt-2 h-12 bg-[#0a0a0a] border-[#2a2a2a] text-white font-sans"
          />
          <p className="font-sans text-xs text-[#6B7280] mt-1.5">От 0 до 10. Рекомендуется 3–5%.</p>
        </div>
        <Button
          onClick={save}
          disabled={saving}
          className="w-full h-12 rounded-lg bg-[#7fffd4] text-black font-sans font-semibold hover:bg-[#40E0D0] transition-colors disabled:opacity-50"
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
      <p className="mt-8">
        <Link href="/admin" className="font-sans text-sm text-[#7fffd4] hover:text-[#AFEEEE] transition-colors">
          ← Дашборд
        </Link>
      </p>
    </div>
  )
}
