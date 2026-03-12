"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function BalancePage() {
  const router = useRouter()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.user) {
          router.replace("/login?returnUrl=/balance")
          return
        }
        setBalance(data.balance ?? 0)
        return fetch("/api/balance").then((r) => r.json())
      })
      .then((data) => {
        if (data?.balance != null) setBalance(data.balance)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  async function handleTopUp() {
    const num = parseFloat(amount)
    if (!num || num < 1) {
      toast.error("Введите сумму от 1 ₽")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Ошибка пополнения")
        return
      }
      toast.success("Баланс пополнен")
      setBalance(data.balance ?? balance)
      setAmount("")
      window.dispatchEvent(new CustomEvent("header-refresh"))
    } finally {
      setSubmitting(false)
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
      <div className="container mx-auto px-4 py-12 pt-28">
        <div className="max-w-md mx-auto">
          <h1 className="font-serif text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Wallet className="w-8 h-8 text-[#7fffd4]" />
            Баланс
          </h1>
          <p className="font-sans text-muted-foreground mb-6">
            Текущий баланс: <span className="text-[#7fffd4] font-semibold">{(balance ?? 0).toLocaleString("ru-RU")} ₽</span>
          </p>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 space-y-4">
            <Label className="text-gray-400 font-sans">Сумма пополнения (₽)</Label>
            <Input
              type="number"
              min={1}
              step={100}
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
            />
            <Button
              onClick={handleTopUp}
              disabled={submitting || !amount || parseFloat(amount) < 1}
              className="w-full bg-[#7fffd4] text-black hover:bg-[#40E0D0] font-sans"
            >
              {submitting ? "Пополнение..." : "Пополнить"}
            </Button>
          </div>
          <p className="mt-4 text-center">
            <Link href="/profile" className="text-sm text-[#7fffd4] hover:underline">
              ← В профиль
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
