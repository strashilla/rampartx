"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

const CATEGORIES = [
  { value: "steam", label: "Steam аккаунты" },
  { value: "discord", label: "Discord аккаунты" },
  { value: "epic", label: "Epic Games" },
  { value: "keys", label: "Игровые ключи" },
  { value: "items", label: "Внутриигровые предметы" },
  { value: "software", label: "Программное обеспечение" },
]

export default function EditLotPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    currency: "RUB",
    quantity: "1",
    imageUrls: [] as string[],
  })

  useEffect(() => {
    if (!id) return
    fetch(`/api/lots/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then((data) => {
        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          category: data.category ? CATEGORIES.find((c) => c.label === data.category)?.value ?? "" : "",
          price: String(data.price ?? ""),
          currency: data.currency ?? "RUB",
          quantity: String(data.quantity ?? 1),
          imageUrls: data.images?.length ? data.images : data.image ? [data.image] : [],
        })
      })
      .catch(() => {
        toast.error("Лот не найден или нет доступа")
        router.replace("/profile")
      })
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || form.title.length < 5) {
      toast.error("Название не менее 5 символов")
      return
    }
    if (form.description.length < 20) {
      toast.error("Описание не менее 20 символов")
      return
    }
    const priceNum = parseFloat(form.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Введите корректную цену")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/lots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category || undefined,
          price: priceNum,
          currency: form.currency,
          quantity: Math.max(1, parseInt(form.quantity, 10) || 1),
          imageUrls: form.imageUrls.length > 0 ? form.imageUrls : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось сохранить")
        return
      }
      toast.success("Лот обновлён")
      router.push("/profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[50vh] items-center justify-center pt-28">
          <Loader2 className="h-10 w-10 animate-spin text-[#7fffd4]" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 pt-24">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          В профиль
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white mb-6">Редактировать лот</h1>
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <div>
            <Label className="text-muted-foreground font-sans">Название</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="mt-1 bg-[#0a0a0a] border-[#2a2a2a] text-white"
              placeholder="Не менее 5 символов"
            />
          </div>
          <div>
            <Label className="text-muted-foreground font-sans">Описание</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="mt-1 bg-[#0a0a0a] border-[#2a2a2a] text-white min-h-[120px]"
              placeholder="Не менее 20 символов"
            />
          </div>
          <div>
            <Label className="text-muted-foreground font-sans">Категория</Label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-white"
            >
              <option value="">Выберите</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-muted-foreground font-sans">Цена</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                className="mt-1 bg-[#0a0a0a] border-[#2a2a2a] text-white"
              />
            </div>
            <div className="w-24">
              <Label className="text-muted-foreground font-sans">Валюта</Label>
              <select
                value={form.currency}
                onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-white"
              >
                <option value="RUB">RUB</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="w-24">
              <Label className="text-muted-foreground font-sans">Кол-во</Label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                className="mt-1 bg-[#0a0a0a] border-[#2a2a2a] text-white"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Изображения можно изменить только при создании нового лота. Текущие: {form.imageUrls.length} шт.
          </p>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans">
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button type="button" variant="outline" asChild className="border-[#2a2a2a] font-sans">
              <Link href="/profile">Отмена</Link>
            </Button>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  )
}
