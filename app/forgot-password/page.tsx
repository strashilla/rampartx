"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = email.trim()
    if (!value) {
      toast.error("Введите email")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Ошибка отправки")
        return
      }
      setSent(true)
      toast.success("Если такой email зарегистрирован, на него отправлена ссылка для сброса пароля.")
    } catch {
      toast.error("Ошибка соединения")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12 pt-24">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-bold text-white mb-2">
                Восстановление пароля
              </h1>
              <p className="text-[#AFEEEE] text-sm">
                Введите email — мы отправим ссылку для сброса пароля
              </p>
            </div>
            {sent ? (
              <p className="text-muted-foreground text-center mb-6">
                Проверьте почту. Если письма нет, проверьте папку «Спам» или попробуйте позже.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#7fffd4] to-[#40E0D0] text-black font-semibold"
                >
                  {isLoading ? "Отправка..." : "Отправить ссылку"}
                </Button>
              </form>
            )}
            <p className="text-center text-gray-400 text-sm mt-6">
              <Link href="/login" className="text-[#7fffd4] hover:text-[#AFEEEE]">
                ← Вернуться к входу
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
